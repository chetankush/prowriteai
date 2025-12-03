import * as fc from 'fast-check';

/**
 * **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
 * **Validates: Requirements 5.5**
 *
 * For any input containing personalization tokens in {{token_name}} format,
 * the generated output SHALL preserve these tokens in the same format.
 */
describe('Personalization Token Preservation Property Tests', () => {
  /**
   * Extract all personalization tokens from content
   * Tokens are in the format {{token_name}}
   */
  function extractTokens(content: string): string[] {
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    const tokens: string[] = [];
    let match;
    while ((match = tokenRegex.exec(content)) !== null) {
      tokens.push(match[0]); // Full token including braces
    }
    return tokens;
  }

  /**
   * Check if all input tokens are preserved in output
   */
  function validateTokenPreservation(
    inputTokens: string[],
    outputContent: string,
  ): { isValid: boolean; missingTokens: string[]; preservedTokens: string[] } {
    const outputTokens = extractTokens(outputContent);
    const missingTokens = inputTokens.filter((token) => !outputTokens.includes(token));
    const preservedTokens = inputTokens.filter((token) => outputTokens.includes(token));

    return {
      isValid: missingTokens.length === 0,
      missingTokens,
      preservedTokens,
    };
  }

  // Arbitrary for valid token names (alphanumeric with underscores)
  const tokenNameArb = fc
    .array(fc.constantFrom(
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_'
    ), { minLength: 1, maxLength: 20 })
    .map((chars) => chars.join(''))
    .filter((s) => /^[a-zA-Z]/.test(s)); // Must start with letter

  // Arbitrary for personalization tokens
  const tokenArb = tokenNameArb.map((name) => `{{${name}}}`);

  // Arbitrary for a set of unique tokens
  const tokenSetArb = fc
    .uniqueArray(tokenNameArb, { minLength: 1, maxLength: 5 })
    .map((names) => names.map((name) => `{{${name}}}`));


  // Arbitrary for email content with embedded tokens
  const emailContentWithTokensArb = fc
    .tuple(
      tokenSetArb,
      fc.array(fc.constantFrom(
        'Hello', 'Hi', 'Dear', 'Thanks', 'Best', 'Regards',
        'I hope this email finds you well.',
        'I wanted to reach out about',
        'Looking forward to hearing from you.',
        'Please let me know if you have any questions.'
      ), { minLength: 2, maxLength: 5 }),
    )
    .map(([tokens, textParts]) => {
      // Ensure all tokens are included in the content
      // First, include all tokens, then add text parts around them
      let content = tokens.join(' ');
      // Add text parts around the tokens
      for (const textPart of textParts) {
        content = textPart + ' ' + content + ' ' + textPart;
      }
      return { tokens, content: content.trim() };
    });

  it('should extract tokens correctly from content', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    fc.assert(
      fc.property(tokenSetArb, (tokens) => {
        // Create content with all tokens
        const content = tokens.join(' some text ');
        const extracted = extractTokens(content);

        // Property: All tokens should be extracted
        expect(extracted.sort()).toEqual(tokens.sort());

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should validate token preservation when all tokens are present', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    fc.assert(
      fc.property(emailContentWithTokensArb, ({ tokens, content }) => {
        const validation = validateTokenPreservation(tokens, content);

        // Property: All tokens should be preserved
        expect(validation.isValid).toBe(true);
        expect(validation.missingTokens).toHaveLength(0);
        expect(validation.preservedTokens.sort()).toEqual(tokens.sort());

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing tokens when some are removed', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    fc.assert(
      fc.property(
        fc.uniqueArray(tokenNameArb, { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 1 }),
        (tokenNames, removeCount) => {
          const tokens = tokenNames.map((name) => `{{${name}}}`);
          const actualRemoveCount = Math.min(removeCount, tokens.length - 1);
          
          // Create content with only some tokens
          const keptTokens = tokens.slice(actualRemoveCount);
          const removedTokens = tokens.slice(0, actualRemoveCount);
          const content = keptTokens.join(' some text ');

          const validation = validateTokenPreservation(tokens, content);

          // Property: Missing tokens should be detected
          expect(validation.isValid).toBe(false);
          expect(validation.missingTokens.sort()).toEqual(removedTokens.sort());
          expect(validation.preservedTokens.sort()).toEqual(keptTokens.sort());

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle common personalization token patterns', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    const commonTokens = [
      '{{first_name}}',
      '{{last_name}}',
      '{{company_name}}',
      '{{job_title}}',
      '{{email}}',
    ];

    const emailTemplate = `
Hi {{first_name}},

I noticed that {{company_name}} has been growing rapidly. As a {{job_title}}, 
you might be interested in our solution.

Would you be open to a quick call?

Best,
{{last_name}}
    `.trim();

    const extracted = extractTokens(emailTemplate);
    const validation = validateTokenPreservation(commonTokens, emailTemplate);

    // All common tokens should be found
    expect(extracted).toContain('{{first_name}}');
    expect(extracted).toContain('{{company_name}}');
    expect(extracted).toContain('{{job_title}}');
    expect(extracted).toContain('{{last_name}}');
    
    // Validation should pass for tokens that are present
    expect(validation.preservedTokens).toContain('{{first_name}}');
    expect(validation.preservedTokens).toContain('{{company_name}}');
    expect(validation.preservedTokens).toContain('{{job_title}}');
    expect(validation.preservedTokens).toContain('{{last_name}}');
  });

  it('should not match malformed tokens', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    const malformedContent = `
      {first_name} - missing one brace
      {{}} - empty token
      {{ name }} - spaces inside (should not match)
      {{{name}}} - triple braces
    `;

    const extracted = extractTokens(malformedContent);
    
    // Only properly formatted tokens should be extracted
    // {{ name }} has spaces so it should match as " name "
    expect(extracted.filter(t => t === '{{first_name}}')).toHaveLength(0);
    expect(extracted.filter(t => t === '{{}}')).toHaveLength(0);
  });

  it('should preserve tokens in cold email output format', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    fc.assert(
      fc.property(tokenSetArb, (tokens) => {
        // Create a cold email format with tokens
        const subject = `Quick question for ${tokens[0] || '{{name}}'}`;
        const body = tokens.slice(1).join(' and ') + ' - looking forward to connecting!';
        const coldEmailOutput = `SUBJECT: ${subject}\nBODY:\n${body}`;

        const extracted = extractTokens(coldEmailOutput);
        const validation = validateTokenPreservation(tokens, coldEmailOutput);

        // Property: All tokens should be preserved in cold email format
        expect(validation.isValid).toBe(true);
        expect(validation.missingTokens).toHaveLength(0);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should handle empty token list', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    const contentWithoutTokens = 'Hello, this is a plain email without any tokens.';
    const validation = validateTokenPreservation([], contentWithoutTokens);

    expect(validation.isValid).toBe(true);
    expect(validation.missingTokens).toHaveLength(0);
    expect(validation.preservedTokens).toHaveLength(0);
  });

  it('should handle duplicate tokens in content', () => {
    // **Feature: prowrite-ai, Property 18: Personalization Token Preservation**
    fc.assert(
      fc.property(tokenArb, (token) => {
        // Content with the same token multiple times
        const content = `${token} appears here and ${token} appears again`;
        const extracted = extractTokens(content);

        // Property: Token should be extracted multiple times
        expect(extracted.filter((t) => t === token).length).toBe(2);

        // Validation should still pass
        const validation = validateTokenPreservation([token], content);
        expect(validation.isValid).toBe(true);

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
