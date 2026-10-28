import { z } from "zod";
import { onlyDigits } from "@/lib/format";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(160),
  company: z.string().trim().min(1, "Informe a empresa").max(160),
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres").max(72),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const eventSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do evento").max(160),
    status: z.enum(["ATIVO", "RASCUNHO", "ENCERRADO"]),
    startDate: z.string(),
    endDate: z.string(),
    allDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    allowOutside: z.boolean(),
    place: z.string().trim().max(200),
    cep: z.string().regex(/^(\d{5}-\d{3})?$/, "CEP inválido"),
    city: z.string().trim().max(120),
    uf: z.string(),
    region: z.string(),
    timezone: z.string(),
    maxDraws: z.string().trim().regex(/^\d*$/, "Informe um número inteiro maior ou igual a 0"),
    website: z.string().trim().max(255),
    bannerMediaId: z.string().nullable(),
    bannerUrl: z.string().nullable(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "A data de fim deve ser igual ou posterior ao início",
  });
export type EventValues = z.infer<typeof eventSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  description: z.string().trim().max(255),
});
export type CategoryValues = z.infer<typeof categorySchema>;

const nonNegativeInt = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${label} deve ser um número inteiro maior ou igual a 0`);

export const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(160),
  sku: z.string().trim().min(1, "Informe o SKU").max(60),
  categoryId: z.string(),
  eventIds: z.array(z.string()),
  weight: z.number().int().min(0).max(100),
  quantity: nonNegativeInt("A quantidade"),
  minStock: nonNegativeInt("O estoque mínimo"),
  imageMediaId: z.string().nullable(),
  imageUrl: z.string().nullable(),
});
export type ProductValues = z.infer<typeof productSchema>;

export const customFieldSchema = z.object({
  label: z.string().trim().min(1, "Informe a pergunta").max(160),
  placeholder: z.string().trim().max(200),
  key: z.string().trim().min(1, "Informe a chave da variável").max(32),
  type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "BOOL"]),
  options: z.array(z.string()),
  required: z.boolean(),
});
export type CustomFieldValues = z.infer<typeof customFieldSchema>;

export const PARTICIPANT_ERROR = "Informe nome e CPF válidos para girar.";

export const participantSchema = z.object({
  name: z.string().trim().min(1, PARTICIPANT_ERROR).max(160),
  email: z.union([z.literal(""), z.string().trim().email("Informe um e-mail válido.")]),
  phone: z.string(),
  cpf: z.string().refine((v) => onlyDigits(v).length === 11, PARTICIPANT_ERROR),
});
export type ParticipantValues = z.infer<typeof participantSchema>;
