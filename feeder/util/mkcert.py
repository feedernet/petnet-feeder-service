# https://nachtimwald.com/2019/11/14/python-self-signed-cert-gen/
import socket
import logging
import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.x509.oid import NameOID

logger = logging.getLogger(__name__)


def generate_self_signed_certificate():
    one_day = datetime.timedelta(1, 0, 0)
    private_key = rsa.generate_private_key(
        public_exponent=65537, key_size=2048, backend=default_backend()
    )
    public_key = private_key.public_key()

    builder = x509.CertificateBuilder()
    builder = builder.subject_name(
        x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, socket.gethostname())])
    )
    builder = builder.issuer_name(
        x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, socket.gethostname())])
    )
    builder = builder.not_valid_before(datetime.datetime.today() - one_day)
    builder = builder.not_valid_after(datetime.datetime.today() + (one_day * 365 * 5))
    builder = builder.serial_number(x509.random_serial_number())
    builder = builder.public_key(public_key)
    logger.debug(
        "Adding SANs for %(hostname)s, *.%(hostname)s, localhost, and *.localhost",
        hostname=socket.gethostname(),
    )
    builder = builder.add_extension(
        x509.SubjectAlternativeName(
            [
                x509.DNSName(socket.gethostname()),
                x509.DNSName("*.%s" % socket.gethostname()),
                x509.DNSName("localhost"),
                x509.DNSName("*.localhost"),
            ]
        ),
        critical=False,
    )
    builder = builder.add_extension(
        x509.BasicConstraints(ca=False, path_length=None), critical=True
    )

    certificate = builder.sign(
        private_key=private_key, algorithm=hashes.SHA256(), backend=default_backend()
    )

    return (
        certificate.public_bytes(serialization.Encoding.PEM),
        private_key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        ),
    )
