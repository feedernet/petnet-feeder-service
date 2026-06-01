import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeeders,
  getFeederTelemetry,
  triggerFeeding,
  modifyFeeder,
  deleteFeeder,
  restartFeeder,
  getHopperLevel,
  setHopperLevel,
  getRecipe,
  setRecipe,
  getFeedHistory,
} from "../api/feeders";

export const useFeeders = () =>
  useQuery({
    queryKey: ["feeders"],
    queryFn: getFeeders,
    refetchInterval: 15000,
  });

export const useFeederTelemetry = (deviceId) =>
  useQuery({
    queryKey: ["feederTelemetry", deviceId],
    queryFn: () => getFeederTelemetry(deviceId),
    enabled: !!deviceId,
  });

export const useHopperLevel = (deviceId) =>
  useQuery({
    queryKey: ["hopperLevel", deviceId],
    queryFn: () => getHopperLevel(deviceId),
    enabled: !!deviceId,
    select: (data) => data.level,
  });

export const useRecipe = (deviceId) =>
  useQuery({
    queryKey: ["recipe", deviceId],
    queryFn: () => getRecipe(deviceId),
    enabled: !!deviceId,
  });

export const useFeedHistory = ({ deviceId = "", pageSize = 10, page = 1 } = {}) =>
  useQuery({
    queryKey: ["feedHistory", { deviceId, pageSize, page }],
    queryFn: () => getFeedHistory({ deviceId, pageSize, page }),
    refetchInterval: 5000,
  });

export const useTriggerFeeding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerFeeding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedHistory"] }),
  });
};

export const useModifyFeeder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: modifyFeeder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeders"] }),
  });
};

export const useDeleteFeeder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFeeder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeders"] }),
  });
};

export const useRestartFeeder = () =>
  useMutation({ mutationFn: restartFeeder });

export const useSetHopperLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setHopperLevel,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["hopperLevel", variables.deviceId] }),
  });
};

export const useSetRecipe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setRecipe,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["recipe", variables.deviceId] }),
  });
};
