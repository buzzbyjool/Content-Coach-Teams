import { z } from 'zod';

export const meetingSchema = z.object({
  id: z.string().optional(),
  coachId: z.string(),
  title: z.string().min(1, "Title is required"),
  startTime: z.date(),
  endTime: z.date(),
  agenda: z.string().min(1, "Agenda is required"),
  attendees: z.array(z.string()).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Meeting = z.infer<typeof meetingSchema>;