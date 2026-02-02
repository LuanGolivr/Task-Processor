import {Status } from '../../prisma/generated/prisma/client.js';

export type QueryTask = {
    title?: string | null;
    status?: Status[];
    processing_time?: {
        gt?: Date;
        lt?: Date;
    };
    started_at?: {
        gt?: Date;
        lt?: Date;
    };
    completed_at?: {
        gt?: Date;
        lt?: Date;
    };
    created_at?: {
        gt?: Date;
        lt?: Date;
    };
    updated_at?: {
        gt?: Date;
        lt?: Date;
    }
}

export type EnqueuedTask = {
    id: string;
    status: Status;
    processing_time: number;
    priority: number;
};