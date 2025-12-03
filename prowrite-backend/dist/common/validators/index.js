"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidInputSchema = exports.IsValidModuleType = void 0;
__exportStar(require("./template-input.validator"), exports);
var template_input_validator_1 = require("./template-input.validator");
Object.defineProperty(exports, "IsValidModuleType", { enumerable: true, get: function () { return template_input_validator_1.IsValidModuleType; } });
Object.defineProperty(exports, "IsValidInputSchema", { enumerable: true, get: function () { return template_input_validator_1.IsValidInputSchema; } });
//# sourceMappingURL=index.js.map