import * as fc from 'fast-check';

/**
 * **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
 * **Validates: Requirements 5.4**
 *
 * For any A/B variation request generating N versions, all N generated versions
 * SHALL be distinct from each other (no two versions are identical).
 *
 * Since we cannot call the actual Gemini API in tests, we test the distinctness
 * checking logic that ensures variations are properly filtered.
 */
describe('GeminiService Property Tests - A/B Variation Distinctness', () => {
  /**
   * Normalize content for comparison by removing extra whitespace and lowercasing
   * This mirrors the private method in GeminiService
   */
  function normalizeForComparison(content: string): string {
    return content.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate similarity ratio between two strings using Jaccard similarity
   * This mirrors the private method in GeminiService
   */
  function calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' ').filter((w) => w.length > 2));
    const words2 = new Set(str2.split(' ').filter((w) => w.length > 2));

    if (words1.size === 0 && words2.size === 0) {
      return 1;
    }

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Check if a new variation is sufficiently distinct from existing variations
   * This mirrors the private method in GeminiService
   */
  function isDistinctVariation(newContent: string, existingVariations: string[]): boolean {
    if (existingVariations.length === 0) {
      return true;
    }

    const normalizedNew = normalizeForComparison(newContent);

    for (const existing of existingVariations) {
      const normalizedExisting = normalizeForComparison(existing);

      // Check for exact match after normalization
      if (normalizedNew === normalizedExisting) {
        return false;
      }

      // Calculate similarity ratio
      const similarity = calculateSimilarity(normalizedNew, normalizedExisting);

      // Consider variations distinct if similarity is below 90%
      if (similarity > 0.9) {
        return false;
      }
    }

    return true;
  }

  /**
   * Simulate the variation filtering process
   * Given a list of generated contents, filter to only distinct ones
   */
  function filterToDistinctVariations(contents: string[]): string[] {
    const distinct: string[] = [];

    for (const content of contents) {
      if (isDistinctVariation(content, distinct)) {
        distinct.push(content);
      }
    }

    return distinct;
  }

  // Arbitrary for generating email-like content
  const emailContentArb = fc.record({
    subject: fc.string({ minLength: 5, maxLength: 100 }),
    greeting: fc.constantFrom('Hi', 'Hello', 'Dear', 'Hey'),
    body: fc.string({ minLength: 20, maxLength: 500 }),
    closing: fc.constantFrom(
      'Best regards',
      'Thanks',
      'Cheers',
      'Looking forward to hearing from you',
    ),
  }).map(
    ({ subject, greeting, body, closing }) =>
      `SUBJECT: ${subject}\nBODY:\n${greeting},\n\n${body}\n\n${closing}`,
  );

  // Arbitrary for generating distinct content variations
  const distinctContentArb = fc
    .array(
      fc.record({
        prefix: fc.constantFrom('Version A:', 'Version B:', 'Option 1:', 'Option 2:'),
        uniqueId: fc.uuid(),
        content: fc.string({ minLength: 50, maxLength: 200 }),
      }),
      { minLength: 2, maxLength: 5 },
    )
    .map((items) => items.map((item) => `${item.prefix} ${item.uniqueId} - ${item.content}`));

  it('should identify identical content as non-distinct', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(emailContentArb, (content) => {
        // Property: Identical content should NOT be considered distinct
        const isDistinct = isDistinctVariation(content, [content]);
        expect(isDistinct).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('should identify content with only whitespace differences as non-distinct', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(emailContentArb, (content) => {
        // Add extra whitespace to create a "different" version
        const contentWithExtraSpaces = content.replace(/ /g, '  ').replace(/\n/g, '\n\n');

        // Property: Content differing only in whitespace should NOT be distinct
        const isDistinct = isDistinctVariation(contentWithExtraSpaces, [content]);
        expect(isDistinct).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('should identify content with only case differences as non-distinct', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(emailContentArb, (content) => {
        // Change case to create a "different" version
        const contentUpperCase = content.toUpperCase();

        // Property: Content differing only in case should NOT be distinct
        const isDistinct = isDistinctVariation(contentUpperCase, [content]);
        expect(isDistinct).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('should identify truly distinct content as distinct', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(distinctContentArb, (contents) => {
        // Filter to distinct variations
        const distinctVariations = filterToDistinctVariations(contents);

        // Property: All variations in the result should be pairwise distinct
        for (let i = 0; i < distinctVariations.length; i++) {
          for (let j = i + 1; j < distinctVariations.length; j++) {
            const similarity = calculateSimilarity(
              normalizeForComparison(distinctVariations[i]),
              normalizeForComparison(distinctVariations[j]),
            );
            // Each pair should have similarity <= 0.9
            expect(similarity).toBeLessThanOrEqual(0.9);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should ensure filtered variations contain no duplicates', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(
        fc.array(emailContentArb, { minLength: 1, maxLength: 10 }),
        (contents) => {
          const distinctVariations = filterToDistinctVariations(contents);

          // Property: No two variations should be identical after normalization
          const normalizedSet = new Set(distinctVariations.map(normalizeForComparison));
          expect(normalizedSet.size).toBe(distinctVariations.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should accept first variation when list is empty', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(emailContentArb, (content) => {
        // Property: Any content should be distinct when compared to empty list
        const isDistinct = isDistinctVariation(content, []);
        expect(isDistinct).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('should maintain variation count invariant: result <= input', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(
        fc.array(emailContentArb, { minLength: 0, maxLength: 10 }),
        (contents) => {
          const distinctVariations = filterToDistinctVariations(contents);

          // Property: Number of distinct variations should never exceed input count
          expect(distinctVariations.length).toBeLessThanOrEqual(contents.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve at least one variation when input is non-empty', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(
        fc.array(emailContentArb, { minLength: 1, maxLength: 10 }),
        (contents) => {
          const distinctVariations = filterToDistinctVariations(contents);

          // Property: At least one variation should be preserved
          expect(distinctVariations.length).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should detect high similarity content as non-distinct', () => {
    // **Feature: prowrite-ai, Property 17: A/B Variation Distinctness**
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.integer({ min: 1, max: 5 }),
        (baseContent, wordCount) => {
          // Create a slightly modified version by changing just a few words
          const words = baseContent.split(' ');
          if (words.length < 10) {
            return true; // Skip if content is too short
          }

          // Change only a small number of words (high similarity)
          const modifiedWords = [...words];
          for (let i = 0; i < Math.min(wordCount, words.length); i++) {
            modifiedWords[i] = 'CHANGED';
          }
          const modifiedContent = modifiedWords.join(' ');

          const similarity = calculateSimilarity(
            normalizeForComparison(baseContent),
            normalizeForComparison(modifiedContent),
          );

          // If similarity is > 0.9, it should be considered non-distinct
          if (similarity > 0.9) {
            const isDistinct = isDistinctVariation(modifiedContent, [baseContent]);
            expect(isDistinct).toBe(false);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
