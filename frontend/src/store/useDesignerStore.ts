import { create } from 'zustand';
import type { DesignTemplate, ParameterValues } from '../templates/types';

interface DesignerStore {
  selectedTemplate: DesignTemplate | null;
  parameters: ParameterValues;

  selectTemplate: (template: DesignTemplate) => void;
  updateParameter: (key: string, value: any) => void;
  resetParameters: () => void;
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  selectedTemplate: null,
  parameters: {},

  // 템플릿 선택 (파라미터 초기화)
  selectTemplate: (template: DesignTemplate) => {
    const initialParams: ParameterValues = {};
    template.parameters.forEach(param => {
      initialParams[param.key] = param.default;
    });

    set({
      selectedTemplate: template,
      parameters: initialParams,
    });
  },

  // 파라미터 업데이트
  updateParameter: (key: string, value: any) => {
    const { parameters } = get();
    set({
      parameters: { ...parameters, [key]: value },
    });
  },

  // 파라미터 초기화
  resetParameters: () => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) return;

    const initialParams: ParameterValues = {};
    selectedTemplate.parameters.forEach(param => {
      initialParams[param.key] = param.default;
    });

    set({ parameters: initialParams });
  },
}));
