import * as fc from 'fast-check';

/**
 * **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
 * **Validates: Requirements 6.3**
 *
 * For any generated landing page copy, the output SHALL contain headline,
 * subheadline, benefits section, and CTA text sections.
 */
describe('Landing Page Output Structure Property Tests', () => {
  /**
   * Parse landing page content to extract structured sections
   * This mirrors the frontend parsing logic
   */
  function parseLandingPageContent(content: string): {
    headline: string;
    subheadline: string;
    benefits: { title: string; description: string }[];
    cta: string;
    metaDescription: string;
  } {
    // Use word boundary or start of line to avoid matching SUBHEADLINE when looking for HEADLINE
    const headlineMatch = content.match(/(?:^|\n)HEADLINE:\s*(.+?)(?:\n|$)/i);
    const subheadlineMatch = content.match(/SUBHEADLINE:\s*(.+?)(?:\n|$)/i);
    const ctaMatch = content.match(/CTA:\s*(.+?)(?:\n|$)/i);
    const metaMatch = content.match(/META_DESCRIPTION:\s*(.+?)(?:\n|$)/i);

    // Parse benefits section
    const benefitsMatch = content.match(
      /BENEFITS:\s*([\s\S]*?)(?=CTA:|META_DESCRIPTION:|$)/i,
    );
    const benefits: { title: string; description: string }[] = [];

    if (benefitsMatch) {
      const benefitsText = benefitsMatch[1];
      const benefitLines = benefitsText
        .split('\n')
        .filter((line) => line.trim().startsWith('-'));

      for (const line of benefitLines) {
        const cleanLine = line.replace(/^-\s*/, '').trim();
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex > 0) {
          benefits.push({
            title: cleanLine.substring(0, colonIndex).trim(),
            description: cleanLine.substring(colonIndex + 1).trim(),
          });
        } else {
          benefits.push({ title: cleanLine, description: '' });
        }
      }
    }

    return {
      headline: headlineMatch?.[1]?.trim() || '',
      subheadline: subheadlineMatch?.[1]?.trim() || '',
      benefits,
      cta: ctaMatch?.[1]?.trim() || '',
      metaDescription: metaMatch?.[1]?.trim() || '',
    };
  }


  /**
   * Validate that landing page output has all required sections
   */
  function validateLandingPageOutput(content: string): {
    isValid: boolean;
    hasHeadline: boolean;
    hasSubheadline: boolean;
    hasBenefits: boolean;
    hasCta: boolean;
  } {
    const parsed = parseLandingPageContent(content);
    const hasHeadline = parsed.headline.length > 0;
    const hasSubheadline = parsed.subheadline.length > 0;
    const hasBenefits = parsed.benefits.length > 0;
    const hasCta = parsed.cta.length > 0;

    return {
      isValid: hasHeadline && hasSubheadline && hasBenefits && hasCta,
      hasHeadline,
      hasSubheadline,
      hasBenefits,
      hasCta,
    };
  }

  // Arbitrary for valid headline text (non-empty, single line)
  const headlineArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
        ' ', '-', '!', '?', '.', ',', "'", '"',
      ),
      { minLength: 10, maxLength: 60 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);

  // Arbitrary for valid subheadline text
  const subheadlineArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
        ' ', '-', '!', '?', '.', ',', "'", '"',
      ),
      { minLength: 15, maxLength: 100 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);

  // Arbitrary for benefit title
  const benefitTitleArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2', ' ', '-',
      ),
      { minLength: 5, maxLength: 30 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);

  // Arbitrary for benefit description
  const benefitDescArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
        ' ', '-', '.', ',',
      ),
      { minLength: 10, maxLength: 80 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);

  // Arbitrary for a single benefit
  const benefitArb = fc
    .tuple(benefitTitleArb, benefitDescArb)
    .map(([title, desc]) => `- ${title}: ${desc}`);

  // Arbitrary for benefits section (3-5 benefits)
  const benefitsSectionArb = fc
    .array(benefitArb, { minLength: 3, maxLength: 5 })
    .map((benefits) => benefits.join('\n'));

  // Arbitrary for CTA text
  const ctaArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2', ' ', '!',
      ),
      { minLength: 5, maxLength: 30 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);

  // Arbitrary for meta description (under 160 chars)
  const metaDescArb = fc
    .array(
      fc.constantFrom(
        'a', 'b', 'c', 'A', 'B', 'C', '0', '1', '2',
        ' ', '-', '.', ',',
      ),
      { minLength: 50, maxLength: 155 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => /^[A-Za-z]/.test(s) && s.trim().length > 0);


  // Arbitrary for valid landing page output format
  const validLandingPageOutputArb = fc
    .tuple(headlineArb, subheadlineArb, benefitsSectionArb, ctaArb, metaDescArb)
    .map(
      ([headline, subheadline, benefits, cta, meta]) =>
        `HEADLINE: ${headline}
SUBHEADLINE: ${subheadline}
BENEFITS:
${benefits}
CTA: ${cta}
META_DESCRIPTION: ${meta}`,
    );

  it('should validate that properly formatted landing page output contains all required sections', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    fc.assert(
      fc.property(validLandingPageOutputArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Valid landing page output must have headline, subheadline, benefits, and CTA
        expect(validation.hasHeadline).toBe(true);
        expect(validation.hasSubheadline).toBe(true);
        expect(validation.hasBenefits).toBe(true);
        expect(validation.hasCta).toBe(true);
        expect(validation.isValid).toBe(true);

        // Verify parsing extracts non-empty values
        const parsed = parseLandingPageContent(content);
        expect(parsed.headline.length).toBeGreaterThan(0);
        expect(parsed.subheadline.length).toBeGreaterThan(0);
        expect(parsed.benefits.length).toBeGreaterThan(0);
        expect(parsed.cta.length).toBeGreaterThan(0);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing headline in landing page output', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const missingHeadlineArb = fc
      .tuple(subheadlineArb, benefitsSectionArb, ctaArb, metaDescArb)
      .map(
        ([subheadline, benefits, cta, meta]) =>
          `SUBHEADLINE: ${subheadline}
BENEFITS:
${benefits}
CTA: ${cta}
META_DESCRIPTION: ${meta}`,
      );

    fc.assert(
      fc.property(missingHeadlineArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Output without headline should be invalid
        expect(validation.hasHeadline).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing subheadline in landing page output', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const missingSubheadlineArb = fc
      .tuple(headlineArb, benefitsSectionArb, ctaArb, metaDescArb)
      .map(
        ([headline, benefits, cta, meta]) =>
          `HEADLINE: ${headline}
BENEFITS:
${benefits}
CTA: ${cta}
META_DESCRIPTION: ${meta}`,
      );

    fc.assert(
      fc.property(missingSubheadlineArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Output without subheadline should be invalid
        expect(validation.hasSubheadline).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing benefits in landing page output', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const missingBenefitsArb = fc
      .tuple(headlineArb, subheadlineArb, ctaArb, metaDescArb)
      .map(
        ([headline, subheadline, cta, meta]) =>
          `HEADLINE: ${headline}
SUBHEADLINE: ${subheadline}
CTA: ${cta}
META_DESCRIPTION: ${meta}`,
      );

    fc.assert(
      fc.property(missingBenefitsArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Output without benefits should be invalid
        expect(validation.hasBenefits).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing CTA in landing page output', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const missingCtaArb = fc
      .tuple(headlineArb, subheadlineArb, benefitsSectionArb, metaDescArb)
      .map(
        ([headline, subheadline, benefits, meta]) =>
          `HEADLINE: ${headline}
SUBHEADLINE: ${subheadline}
BENEFITS:
${benefits}
META_DESCRIPTION: ${meta}`,
      );

    fc.assert(
      fc.property(missingCtaArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Output without CTA should be invalid
        expect(validation.hasCta).toBe(false);
        expect(validation.isValid).toBe(false);

        return true;
      }),
      { numRuns: 100 },
    );
  });


  it('should correctly parse benefits with title and description', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    fc.assert(
      fc.property(validLandingPageOutputArb, (content) => {
        const parsed = parseLandingPageContent(content);

        // Property: Each benefit should have a title
        for (const benefit of parsed.benefits) {
          expect(benefit.title.length).toBeGreaterThan(0);
        }

        // Property: Benefits count should be between 3 and 5 (as per our arbitrary)
        expect(parsed.benefits.length).toBeGreaterThanOrEqual(3);
        expect(parsed.benefits.length).toBeLessThanOrEqual(5);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should handle real-world landing page output formats', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const realWorldExamples = [
      `HEADLINE: Transform Your Business with AI-Powered Analytics
SUBHEADLINE: Get actionable insights from your data in minutes, not months
BENEFITS:
- Real-time Insights: See what's happening in your business as it happens
- Easy Integration: Connect to your existing tools in just a few clicks
- Scalable Solution: Grows with your business from startup to enterprise
- Cost Effective: Save up to 60% compared to traditional analytics solutions
CTA: Start Your Free Trial Today
META_DESCRIPTION: Transform your business with AI-powered analytics. Get real-time insights, easy integration, and scalable solutions. Start your free trial today.`,
      `HEADLINE: The Future of Project Management is Here
SUBHEADLINE: Streamline your workflow and boost team productivity by 40%
BENEFITS:
- Smart Automation: Automate repetitive tasks and focus on what matters
- Team Collaboration: Keep everyone aligned with real-time updates
- Visual Dashboards: Track progress at a glance with intuitive charts
CTA: Get Started Free
META_DESCRIPTION: Discover the future of project management. Boost productivity by 40% with smart automation and team collaboration tools.`,
    ];

    for (const example of realWorldExamples) {
      const validation = validateLandingPageOutput(example);
      expect(validation.isValid).toBe(true);
      expect(validation.hasHeadline).toBe(true);
      expect(validation.hasSubheadline).toBe(true);
      expect(validation.hasBenefits).toBe(true);
      expect(validation.hasCta).toBe(true);

      const parsed = parseLandingPageContent(example);
      expect(parsed.headline.length).toBeGreaterThan(0);
      expect(parsed.subheadline.length).toBeGreaterThan(0);
      expect(parsed.benefits.length).toBeGreaterThanOrEqual(3);
      expect(parsed.cta.length).toBeGreaterThan(0);
    }
  });

  it('should be case-insensitive when parsing section markers', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const caseVariationsArb = fc
      .tuple(
        headlineArb,
        subheadlineArb,
        benefitsSectionArb,
        ctaArb,
        metaDescArb,
        fc.constantFrom('HEADLINE', 'Headline', 'headline'),
        fc.constantFrom('SUBHEADLINE', 'Subheadline', 'subheadline'),
        fc.constantFrom('BENEFITS', 'Benefits', 'benefits'),
        fc.constantFrom('CTA', 'Cta', 'cta'),
        fc.constantFrom('META_DESCRIPTION', 'Meta_Description', 'meta_description'),
      )
      .map(
        ([
          headline,
          subheadline,
          benefits,
          cta,
          meta,
          headlineMarker,
          subheadlineMarker,
          benefitsMarker,
          ctaMarker,
          metaMarker,
        ]) =>
          `${headlineMarker}: ${headline}
${subheadlineMarker}: ${subheadline}
${benefitsMarker}:
${benefits}
${ctaMarker}: ${cta}
${metaMarker}: ${meta}`,
      );

    fc.assert(
      fc.property(caseVariationsArb, (content) => {
        const validation = validateLandingPageOutput(content);

        // Property: Parsing should work regardless of case
        expect(validation.hasHeadline).toBe(true);
        expect(validation.hasSubheadline).toBe(true);
        expect(validation.hasBenefits).toBe(true);
        expect(validation.hasCta).toBe(true);
        expect(validation.isValid).toBe(true);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should reject empty content', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    const emptyContent = '';
    const validation = validateLandingPageOutput(emptyContent);
    expect(validation.isValid).toBe(false);
    expect(validation.hasHeadline).toBe(false);
    expect(validation.hasSubheadline).toBe(false);
    expect(validation.hasBenefits).toBe(false);
    expect(validation.hasCta).toBe(false);
  });

  it('should handle meta description as optional but parse it when present', () => {
    // **Feature: prowrite-ai, Property 20: Landing Page Output Structure**
    // Meta description is optional for validity but should be parsed when present
    const withMetaArb = validLandingPageOutputArb;
    const withoutMetaArb = fc
      .tuple(headlineArb, subheadlineArb, benefitsSectionArb, ctaArb)
      .map(
        ([headline, subheadline, benefits, cta]) =>
          `HEADLINE: ${headline}
SUBHEADLINE: ${subheadline}
BENEFITS:
${benefits}
CTA: ${cta}`,
      );

    // With meta description
    fc.assert(
      fc.property(withMetaArb, (content) => {
        const parsed = parseLandingPageContent(content);
        expect(parsed.metaDescription.length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 50 },
    );

    // Without meta description - still valid but meta is empty
    fc.assert(
      fc.property(withoutMetaArb, (content) => {
        const parsed = parseLandingPageContent(content);
        const validation = validateLandingPageOutput(content);

        // Core sections should still be valid
        expect(validation.hasHeadline).toBe(true);
        expect(validation.hasSubheadline).toBe(true);
        expect(validation.hasBenefits).toBe(true);
        expect(validation.hasCta).toBe(true);

        // Meta description should be empty
        expect(parsed.metaDescription).toBe('');

        return true;
      }),
      { numRuns: 50 },
    );
  });
});
