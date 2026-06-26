import { 
  mysqlTable, 
  varchar, 
  text, 
  int, 
  boolean, 
  timestamp, 
  uniqueIndex, 
  index, 
  mysqlEnum
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }),
  username: varchar('username', { length: 50 }).unique(),
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: timestamp('email_verified'),
  password: varchar('password', { length: 255 }),
  provider: varchar('provider', { length: 50 }),
  providerAccountId: varchar('provider_account_id', { length: 255 }),
  image: text('image'),
  banner: text('banner'),
  bio: varchar('bio', { length: 300 }),
  college: varchar('college', { length: 200 }),
  course: varchar('course', { length: 100 }),
  semester: varchar('semester', { length: 20 }),
  twitterUrl: varchar('twitter_url', { length: 500 }),
  githubUrl: varchar('github_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  websiteUrl: varchar('website_url', { length: 500 }),
  role: mysqlEnum('role', ['user', 'admin']).default('user'),
  isPrivate: boolean('is_private').default(false),
  isBanned: boolean('is_banned').default(false),
  followersCount: int('followers_count').default(0),
  followingCount: int('following_count').default(0),
  postsCount: int('posts_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: int('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => [
  uniqueIndex('accounts_provider_provider_account_id_idx').on(table.provider, table.providerAccountId),
]);

export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = mysqlTable('verification_tokens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => [
  uniqueIndex('verification_tokens_identifier_token_idx').on(table.identifier, table.token),
]);

export const posts = mysqlTable('posts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  subject: varchar('subject', { length: 100 }),
  course: varchar('course', { length: 100 }),
  semester: varchar('semester', { length: 20 }),
  college: varchar('college', { length: 200 }),
  resourceType: mysqlEnum('resource_type', ['pdf', 'image', 'document', 'presentation', 'zip', 'text']),
  threadId: varchar('thread_id', { length: 36 }),
  threadOrder: int('thread_order').default(0),
  likesCount: int('likes_count').default(0),
  commentsCount: int('comments_count').default(0),
  downloadsCount: int('downloads_count').default(0),
  bookmarksCount: int('bookmarks_count').default(0),
  viewsCount: int('views_count').default(0),
  trendingScore: int('trending_score').default(0),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const files = mysqlTable('files', {
  id: varchar('id', { length: 36 }).primaryKey(),
  postId: varchar('post_id', { length: 36 }).references(() => posts.id, { onDelete: 'set null' }),
  fileName: varchar('file_name', { length: 255 }),
  originalName: varchar('original_name', { length: 255 }),
  fileUrl: text('file_url'),
  fileSize: int('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  fileType: mysqlEnum('file_type', ['pdf', 'image', 'document', 'presentation', 'zip']),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = mysqlTable('comments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: varchar('parent_id', { length: 36 }),
  content: text('content'),
  likesCount: int('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const likes = mysqlTable('likes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('likes_user_id_post_id_idx').on(table.userId, table.postId),
]);

export const bookmarks = mysqlTable('bookmarks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  collectionId: varchar('collection_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('bookmarks_user_id_post_id_idx').on(table.userId, table.postId),
]);

export const bookmarkCollections = mysqlTable('bookmark_collections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }),
  description: varchar('description', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const follows = mysqlTable('follows', {
  id: varchar('id', { length: 36 }).primaryKey(),
  followerId: varchar('follower_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: varchar('following_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('follows_follower_id_following_id_idx').on(table.followerId, table.followingId),
]);

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorId: varchar('actor_id', { length: 36 }).references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['like', 'comment', 'follow', 'mention', 'download']),
  postId: varchar('post_id', { length: 36 }).references(() => posts.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 300 }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).unique(),
  slug: varchar('slug', { length: 100 }).unique(),
  postsCount: int('posts_count').default(0),
});

export const postTags = mysqlTable('post_tags', {
  id: varchar('id', { length: 36 }).primaryKey(),
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: varchar('tag_id', { length: 36 }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  uniqueIndex('post_tags_post_id_tag_id_idx').on(table.postId, table.tagId),
]);

export const downloads = mysqlTable('downloads', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = mysqlTable('reports', {
  id: varchar('id', { length: 36 }).primaryKey(),
  reporterId: varchar('reporter_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: mysqlEnum('target_type', ['post', 'user']),
  targetId: varchar('target_id', { length: 36 }),
  reason: mysqlEnum('reason', ['spam', 'inappropriate', 'copyright', 'harassment', 'other']),
  description: text('description'),
  status: mysqlEnum('status', ['pending', 'reviewed', 'resolved', 'dismissed']).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const recentSearches = mysqlTable('recent_searches', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  query: varchar('query', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailLogs = mysqlTable('email_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  to: varchar('to_email', { length: 255 }),
  subject: varchar('subject', { length: 500 }),
  body: text('body'),
  purpose: varchar('purpose', { length: 100 }),
  status: mysqlEnum('status', ['sent', 'failed', 'pending']),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tickets = mysqlTable('tickets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 255 }),
  category: mysqlEnum('category', ['bug', 'feature', 'account', 'content', 'general', 'other']),
  message: text('message'),
  status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']),
  adminReply: text('admin_reply'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSettings = mysqlTable('user_settings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  likeNotifications: boolean('like_notifications').default(true),
  commentNotifications: boolean('comment_notifications').default(true),
  followNotifications: boolean('follow_notifications').default(true),
  downloadNotifications: boolean('download_notifications').default(true),
  isPrivate: boolean('is_private').default(false),
  showEmail: boolean('show_email').default(false),
  showFollowers: boolean('show_followers').default(true),
  allowComments: boolean('allow_comments').default(true),
  appearInSearch: boolean('appear_in_search').default(true),
  theme: varchar('theme', { length: 20 }).default('system'),
  compactMode: boolean('compact_mode').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
  bookmarkCollections: many(bookmarkCollections),
  followers: many(follows, { relationName: 'followers' }),
  following: many(follows, { relationName: 'following' }),
  notifications: many(notifications),
  downloads: many(downloads),
  reports: many(reports),
  recentSearches: many(recentSearches),
  emailLogs: many(emailLogs),
  tickets: many(tickets),
  settings: one(userSettings),
  discussions: many(discussions),
  discussionLikes: many(discussionLikes),
  discussionReplies: many(discussionReplies),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  files: many(files),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
  tags: many(postTags),
  downloads: many(downloads),
}));

export const filesRelations = relations(files, ({ one }) => ({
  post: one(posts, {
    fields: [files.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'followers',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [downloads.postId],
    references: [posts.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  user: one(users, {
    fields: [emailLogs.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
export const discussions = mysqlTable('discussions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likesCount: int('likes_count').default(0),
  repliesCount: int('replies_count').default(0),
  viewsCount: int('views_count').default(0),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const discussionLikes = mysqlTable('discussion_likes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  discussionId: varchar('discussion_id', { length: 36 }).notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('discussion_likes_user_id_discussion_id_idx').on(table.userId, table.discussionId),
]);

export const discussionReplies = mysqlTable('discussion_replies', {
  id: varchar('id', { length: 36 }).primaryKey(),
  discussionId: varchar('discussion_id', { length: 36 }).notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: varchar('parent_id', { length: 36 }),
  content: text('content').notNull(),
  likesCount: int('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  user: one(users, {
    fields: [discussions.userId],
    references: [users.id],
  }),
  replies: many(discussionReplies),
  likes: many(discussionLikes),
}));

export const discussionLikesRelations = relations(discussionLikes, ({ one }) => ({
  user: one(users, {
    fields: [discussionLikes.userId],
    references: [users.id],
  }),
  discussion: one(discussions, {
    fields: [discussionLikes.discussionId],
    references: [discussions.id],
  }),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one }) => ({
  discussion: one(discussions, {
    fields: [discussionReplies.discussionId],
    references: [discussions.id],
  }),
  user: one(users, {
    fields: [discussionReplies.userId],
    references: [users.id],
  }),
}));
