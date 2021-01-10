import logging
import asyncio
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from feeder import settings
from feeder.api.routers import kronos, feeder, pet
from feeder.util.mqtt import FeederClient, FeederBroker
from feeder.database.session import db

logger = logging.getLogger("feeder")


async def startup_event():
    await db.connect()
    async_loop.create_task(broker.start())
    async_loop.create_task(client.start())


async def shutdown_event():
    await asyncio.gather([broker.shutdown()], return_exceptions=True)
    await db.disconnect()


def handle_exception(loop, context):
    if "exception" in context:
        logging.error("Caught global exception:", exc_info=context["exception"])
    else:
        msg = context["message"]
        logging.error("Caught global exception: %s", msg)


frontend_template = Jinja2Templates(directory="static/build")
async_loop = asyncio.get_event_loop()
async_loop.set_exception_handler(handle_exception)
client = FeederClient()
broker = FeederBroker()

mqtt_enabled_routers = [feeder, pet]
for mqtt_router in mqtt_enabled_routers:
    mqtt_router.router.client = client
    mqtt_router.router.broker = broker


def get_application() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version="1.0",
    )

    frontend = Path("./static/build/index.html")
    if frontend.exists():
        app.mount(
            f"{settings.app_root}/build",
            StaticFiles(directory="./static/build", html=True),
            name="static",
        )
    app.include_router(kronos.router, prefix="/api/v1/kronos")
    app.include_router(feeder.router, prefix=f"{settings.app_root}/api/v1/feeder")
    app.include_router(pet.router, prefix=f"{settings.app_root}/api/v1/pet")

    app.add_event_handler("startup", startup_event)
    app.add_event_handler("shutdown", shutdown_event)

    @app.get(f"{settings.app_root}/{{full_path:path}}", response_class=HTMLResponse)
    async def render_frontend(full_path: str, request: Request):
        frontend_paths = ["settings", "feeders", ""]
        if full_path not in frontend_paths:
            raise HTTPException(status_code=404)

        if frontend.exists():
            build_path = "build"
            if settings.app_root:
                build_path = f"{settings.app_root[1:]}/build"
            return frontend_template.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "build_path": build_path,
                    "root_path": settings.app_root,
                },
            )

        logger.warning("Caught frontend request without built frontend.")
        raise HTTPException(status_code=500, detail="Frontend not built!")

    return app
