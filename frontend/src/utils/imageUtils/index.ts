/**
 * Image utilities - modularized version
 *
 * Module structure:
 * - polygon.ts: Polygon helper functions (area, CCW, point-in-polygon, nesting)
 * - pixelMap.ts: Pixel data processing and legacy bitmap conversion
 * - marchingSquares.ts: Marching Squares algorithm wrapper
 * - contours.ts: Main contour extraction and THREE.js shape conversion
 */

// Re-export polygon utilities
export {
  type Point,
  getSignedArea,
  isCCW,
  ensureCCW,
  isPointInPolygon,
  calculateNestingLevel,
  findDirectParent,
} from './polygon';

// Re-export pixel map utilities
export {
  type PixelMap,
  imageToPixelMap,
  imageFileToDataURL,
} from './pixelMap';

// Re-export marching squares
export { extractContours } from './marchingSquares';

// Re-export contour utilities (main exports)
export {
  type ImageContours,
  imageToContours,
} from './contours';
