import { createSlice } from '@reduxjs/toolkit';
import { TField } from '@/types/types';

export type TFieldsState = {
  fields: TField[];
};

const initialState: TFieldsState = {
  fields: [],
};

const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {
    setFields: (state, action) => {
      state.fields = action.payload;
    },
    clearFields: (state) => {
      state.fields = [];
    },
    updateFieldInsights: (state, action) => {
      const { fieldId, insights } = action.payload;
      const fieldIndex = state.fields.findIndex((field) => field.fieldId === fieldId);
      if (fieldIndex !== -1) {
        state.fields[fieldIndex].insights = insights;
      }
    },
    updateFieldSensorData: (state, action) => {
      const { fieldId, sensorData } = action.payload;
      const fieldIndex = state.fields.findIndex((field) => field.fieldId === fieldId);
      if (fieldIndex !== -1) {
        state.fields[fieldIndex].sensorData = sensorData;
      }
    },
  },
});

export const { setFields, clearFields, updateFieldInsights, updateFieldSensorData } = fieldsSlice.actions;
export default fieldsSlice.reducer;