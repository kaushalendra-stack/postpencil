import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional(),
  subject: z.string().max(100, 'Subject must be 100 characters or less').optional(),
  course: z.string().max(100, 'Course must be 100 characters or less').optional(),
  semester: z.string().max(20, 'Semester must be 20 characters or less').optional(),
  college: z.string().max(200, 'College must be 200 characters or less').optional(),
  tags: z.array(z.string().max(100)).max(10, 'Maximum 10 tags allowed').optional(),
  threadId: z.string().uuid().optional(),
  threadOrder: z.number().int().min(0).optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment must be 2000 characters or less'),
  parentId: z.string().uuid().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  college: z.string().max(200, 'College must be 200 characters or less').optional(),
  course: z.string().max(100, 'Course must be 100 characters or less').optional(),
  semester: z.string().max(20, 'Semester must be 20 characters or less').optional(),
  twitterUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
})

export const discussionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be 10000 characters or less'),
})

export const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty').max(2000, 'Reply must be 2000 characters or less'),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be 30 characters or less').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().min(1, 'Token is required'),
  id: z.string().min(1, 'ID is required'),
})

export const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  category: z.enum(['bug', 'feature', 'account', 'content', 'general']),
  priority: z.enum(['low', 'medium', 'high']),
  message: z.string().min(1, 'Message is required').max(5000),
})

export const reportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required').max(500),
  description: z.string().max(2000).optional(),
})

export const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  likeNotifications: z.boolean().optional(),
  commentNotifications: z.boolean().optional(),
  followNotifications: z.boolean().optional(),
  downloadNotifications: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showFollowers: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  appearInSearch: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  compactMode: z.boolean().optional(),
})

export type PostInput = z.infer<typeof postSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type DiscussionInput = z.infer<typeof discussionSchema>
export type ReplyInput = z.infer<typeof replySchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TicketInput = z.infer<typeof ticketSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
