export interface PipelineTemplateStage {
    id?: number;
    name: string;
    position: number;
    color: string;
}

export interface PipelineTemplate {
    id?: number;
    name: string;
    stages: PipelineTemplateStage[];
}
