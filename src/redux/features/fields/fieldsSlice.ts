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
  },
});

export const { setFields, clearFields } = fieldsSlice.actions;
export default fieldsSlice.reducer;