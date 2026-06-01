import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPets,
  createPet,
  modifyPet,
  deletePet,
  getPetSchedule,
  createPetSchedule,
  updatePetSchedule,
  deletePetSchedule,
} from "../api/pets";

export const usePets = () =>
  useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

export const useCreatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
};

export const useModifyPet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: modifyPet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
};

export const useDeletePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
};

export const usePetSchedule = (petId) =>
  useQuery({
    queryKey: ["petSchedule", petId],
    queryFn: () => getPetSchedule(petId),
    enabled: !!petId,
    select: (data) => data.events,
    refetchInterval: 60000,
  });

export const useCreatePetSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPetSchedule,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["petSchedule", variables.petId] }),
  });
};

export const useUpdatePetSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePetSchedule,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["petSchedule", variables.petId] }),
  });
};

export const useDeletePetSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePetSchedule,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["petSchedule", variables.petId] }),
  });
};
