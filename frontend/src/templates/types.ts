import type { Geom3 } from '@jscad/modeling/src/geometries/types';

// 파라미터 정의
export interface ParameterDefinition {
  key: string;
  label: string;
  type: 'number' | 'angle' | 'text' | 'boolean';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// 파라미터 값 (동적 객체)
export type ParameterValues = Record<string, any>;

// 디자인 템플릿
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  parameters: ParameterDefinition[];
  generate: (params: ParameterValues) => Geom3;
}
