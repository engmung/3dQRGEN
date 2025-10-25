/**
 * Marching Squares algorithm wrapper
 * Uses external marchingsquares library for contour extraction
 */

import * as MarchingSquares from 'marchingsquares';

/**
 * Extract contours from binary grid using Marching Squares algorithm
 * @param grid - 2D array of numbers (0 or 1)
 * @param threshold - Threshold value for contour extraction (default 0.5)
 * @returns Array of contours, each contour is an array of [x, y] points
 */
export function extractContours(grid: number[][], threshold: number = 0.5): number[][][] {
  return MarchingSquares.isoLines(grid, threshold);
}
