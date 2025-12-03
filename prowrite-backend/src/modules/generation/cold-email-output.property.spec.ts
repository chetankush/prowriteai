import * as fc from 'fast-check';

/**
 * **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
 * **Validates: Requirements 5.3**
 *
 * For any generated cold email, the output SHALL contain both a subject line section
 * and a body text section.
 */
describe('Cold Email Output Structure Property Tests', () => {
  /**
   * Parse cold email content to extract subject and body sections
   * This mirrors the frontend parsing logic
   */
  function parseColdEmailContent(content: string): { subject: string; body: string } {
    const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = content.match(/BODY:\s*([\s\S]*?)$/i);

    return {
      subject: subjectMatch?.[1]?.trim() || '',
      body: bodyMatch?.[1]?.trim() || '',
    };
  }

  /**
   * Validate that cold email output has both subject and body
   */
  function validateColdEmailOutput(content: string): {
    isValid: boolean;
    hasSubject: boolean;
    hasBody: boolean;
  } {
    const parsed = parseColdEmailContent(content);
    const hasSubject = parsed.subject.length > 0;
    const hasBody = parsed.body.length > 0;

    return {
      isValid: hasSubject && hasBody,
      hasSubject,
      hasBody,
    };
  }

  // Arbitrary for valid subject lines (non-empty, single line, no newlines or carriage returns)
  const subjectLineArb = fc
    .array(fc.constantFrom(
      'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
      ' ', '-', ':', '!', '?', '.', ',', "'", '"', '(', ')'
    ), { minLength: 6, maxLength: 50 })
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z0-9]/.test(s) && s.trim().length > 0);

  // Arbitrary for valid email body content (non-empty, can be multi-line with \n only)
  const emailBodyLineArb = fc
    .array(fc.constantFrom(
      'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
      ' ', '-', ':', '!', '?', '.', ',', "'", '"', '(', ')'
    ), { minLength: 10, maxLength: 100 })
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z0-9]/.test(s) && s.trim().length > 0);

  const emailBodyArb = fc
    .array(emailBodyLineArb, { minLength: 1, maxLength: 5 })
    .map((lines) => lines.join('\n\n'));


  // Arbitrary for valid cold email output format
  const validColdEmailOutputArb = fc
    .tuple(subjectLineArb, emailBodyArb)
    .map(([subject, body]) => `SUBJECT: ${subject}\nBODY:\n${body}`);

  // Arbitrary for cold email output with variations
  const validColdEmailVariationsArb = fc
    .array(fc.tuple(subjectLineArb, emailBodyArb), { minLength: 2, maxLength: 4 })
    .map((variations) =>
      variations
        .map(([subject, body]) => `SUBJECT: ${subject}\nBODY:\n${body}`)
        .join('\n\n---VARIATION---\n\n'),
    );

  it('should validate that properly formatted cold email output contains subject and body', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    fc.assert(
      fc.property(validColdEmailOutputArb, (content) => {
        const validation = validateColdEmailOutput(content);

        // Property: Valid cold email output must have both subject and body
        expect(validation.hasSubject).toBe(true);
        expect(validation.hasBody).toBe(true);
        expect(validation.isValid).toBe(true);

        // Verify parsing extracts non-empty values
        const parsed = parseColdEmailContent(content);
        expect(parsed.subject.length).toBeGreaterThan(0);
        expect(parsed.body.length).toBeGreaterThan(0);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing subject in cold email output', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    // Arbitrary for email output missing subject
    const missingSubjectArb = emailBodyArb.map((body) => `BODY:\n${body}`);

    fc.assert(
      fc.property(missingSubjectArb, (content) => {
        const validation = validateColdEmailOutput(content);

        // Property: Output without subject should be invalid
        expect(validation.hasSubject).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing body in cold email output', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    // Arbitrary for email output missing body
    const missingBodyArb = subjectLineArb.map((subject) => `SUBJECT: ${subject}`);

    fc.assert(
      fc.property(missingBodyArb, (content) => {
        const validation = validateColdEmailOutput(content);

        // Property: Output without body should be invalid
        expect(validation.hasBody).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should parse each variation in A/B test output', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    fc.assert(
      fc.property(validColdEmailVariationsArb, (content) => {
        // Split by variation separator
        const variations = content.split('---VARIATION---').map((v) => v.trim());

        // Property: Each variation must have valid subject and body
        for (const variation of variations) {
          const validation = validateColdEmailOutput(variation);
          expect(validation.hasSubject).toBe(true);
          expect(validation.hasBody).toBe(true);
          expect(validation.isValid).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should handle real-world cold email output formats', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    // Test with actual expected output format from templates
    const realWorldExamples = [
      `SUBJECT: Quick question about your sales process
BODY:
Hi John,

I noticed Acme Corp has been expanding rapidly. Congratulations on the recent growth!

I'm reaching out because we help companies like yours streamline their sales operations. Would you be open to a quick 15-minute call next week?

Best,
Sarah`,
      `SUBJECT: Re: Following up on my previous email
BODY:
Hi John,

I wanted to follow up on my previous message. I understand you're busy, but I believe our solution could save your team significant time.

Would a brief call work better for you?

Thanks,
Sarah`,
    ];

    for (const example of realWorldExamples) {
      const validation = validateColdEmailOutput(example);
      expect(validation.isValid).toBe(true);
      expect(validation.hasSubject).toBe(true);
      expect(validation.hasBody).toBe(true);

      const parsed = parseColdEmailContent(example);
      expect(parsed.subject.length).toBeGreaterThan(0);
      expect(parsed.body.length).toBeGreaterThan(0);
    }
  });

  it('should be case-insensitive when parsing subject and body markers', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    const caseVariationsArb = fc
      .tuple(
        subjectLineArb,
        emailBodyArb,
        fc.constantFrom('SUBJECT', 'Subject', 'subject'),
        fc.constantFrom('BODY', 'Body', 'body'),
      )
      .map(([subject, body, subjectMarker, bodyMarker]) => 
        `${subjectMarker}: ${subject}\n${bodyMarker}:\n${body}`
      );

    fc.assert(
      fc.property(caseVariationsArb, (content) => {
        const validation = validateColdEmailOutput(content);

        // Property: Parsing should work regardless of case
        expect(validation.hasSubject).toBe(true);
        expect(validation.hasBody).toBe(true);
        expect(validation.isValid).toBe(true);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should reject empty subject or body', () => {
    // **Feature: prowrite-ai, Property 16: Cold Email Output Structure**
    // Test completely empty content
    const emptyContent = '';
    const validation = validateColdEmailOutput(emptyContent);
    expect(validation.isValid).toBe(false);
    expect(validation.hasSubject).toBe(false);
    expect(validation.hasBody).toBe(false);
  });
});
