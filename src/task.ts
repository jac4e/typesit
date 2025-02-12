export interface ITaskLean {
    stopped: boolean; 
    name: string;
    lastRun: Date | null;
    nextRun: Date | null;
}