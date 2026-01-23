export * from './registry';
export * from './types';

import { singleSelectConfig } from './SingleSelect';
import { multiSelectConfig } from './MultiSelect';
import { openTextConfig } from './OpenText';
import { fileUploadConfig } from './FileUpload';
import { conditionalConfig } from './Conditional';
import { matrixConfig } from './Matrix';
import { registerQuestionType } from './registry';

registerQuestionType(singleSelectConfig);
registerQuestionType(multiSelectConfig);
registerQuestionType(openTextConfig);
registerQuestionType(fileUploadConfig);
registerQuestionType(conditionalConfig);
registerQuestionType(matrixConfig);

export { singleSelectConfig, multiSelectConfig, openTextConfig, fileUploadConfig, conditionalConfig, matrixConfig };
