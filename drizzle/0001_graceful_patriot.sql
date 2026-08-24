CREATE TABLE `loaEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loaRecordId` varchar(36) NOT NULL,
	`actorUserId` int,
	`action` varchar(100) NOT NULL,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loaEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loaRecords` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`templateVersionId` varchar(36) NOT NULL,
	`createdById` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`referenceNumber` varchar(100) NOT NULL,
	`fieldData` json NOT NULL,
	`status` enum('draft','in_review','generated','handoff_ready','sent_to_sharepoint','failed') NOT NULL DEFAULT 'draft',
	`conversionStatus` enum('not_started','in_progress','completed','failed') NOT NULL DEFAULT 'not_started',
	`reviewConfirmed` boolean NOT NULL DEFAULT false,
	`reviewedAt` timestamp,
	`generatedAt` timestamp,
	`generatedDocxKey` varchar(600),
	`generatedDocxUrl` varchar(700),
	`generatedPdfKey` varchar(600),
	`generatedPdfUrl` varchar(700),
	`filename` varchar(255),
	`intendedSharePointPath` varchar(500),
	`handoffStatus` enum('not_prepared','prepared','downloaded','uploaded','signed') NOT NULL DEFAULT 'not_prepared',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loaRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(32) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `templateFields` (
	`id` varchar(36) NOT NULL,
	`templateId` varchar(36) NOT NULL,
	`fieldKey` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`fieldScope` enum('shared','project') NOT NULL DEFAULT 'project',
	`isRequired` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templateFields_id` PRIMARY KEY(`id`),
	CONSTRAINT `template_fields_key_unique` UNIQUE(`templateId`,`fieldKey`)
);
--> statement-breakpoint
CREATE TABLE `templateVersions` (
	`id` varchar(36) NOT NULL,
	`templateId` varchar(36) NOT NULL,
	`version` varchar(32) NOT NULL,
	`status` enum('draft','approved','superseded') NOT NULL DEFAULT 'draft',
	`sourceFilename` varchar(255) NOT NULL,
	`docxStorageKey` varchar(600) NOT NULL,
	`docxUrl` varchar(700) NOT NULL,
	`uploadedById` int NOT NULL,
	`approvedById` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templateVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `template_versions_unique` UNIQUE(`templateId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `loa_events_record_idx` ON `loaEvents` (`loaRecordId`);--> statement-breakpoint
CREATE INDEX `loa_records_project_idx` ON `loaRecords` (`projectId`);--> statement-breakpoint
CREATE INDEX `loa_records_creator_idx` ON `loaRecords` (`createdById`);--> statement-breakpoint
CREATE INDEX `loa_records_status_idx` ON `loaRecords` (`status`);--> statement-breakpoint
CREATE INDEX `template_fields_template_idx` ON `templateFields` (`templateId`);--> statement-breakpoint
CREATE INDEX `template_versions_template_idx` ON `templateVersions` (`templateId`);--> statement-breakpoint
CREATE INDEX `templates_project_idx` ON `templates` (`projectId`);