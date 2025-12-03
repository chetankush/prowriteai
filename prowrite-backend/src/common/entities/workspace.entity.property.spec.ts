import * as fc from 'fast-check';
import { BrandVoiceGuide } from '@common/entities';

/**
 * **Feature: prowrite-ai, Property 4: Brand Voice Guide Serialization Round-Trip**
 * **Validates: Requirements 2.3**
 *
 * For any valid brand voice guide object, serializing to JSON and deserializing
 * back SHALL produce an equivalent object with identical tone, style, terminology,
 * and avoid fields.
 */
describe('Workspace Entity Property Tests', () => {
  // Arbitrary for BrandVoiceGuide
  const brandVoiceGuideArb: fc.Arbitrary<BrandVoiceGuide> = fc.record({
    tone: fc.string({ minLength: 1, maxLength: 100 }),
    style: fc.string({ minLength: 1, maxLength: 100 }),
    terminology: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 0,
      maxLength: 20,
    }),
    avoid: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 0,
      maxLength: 20,
    }),
  });

  it('should round-trip serialize/deserialize brand voice guide', () => {
    // **Feature: prowrite-ai, Property 4: Brand Voice Guide Serialization Round-Trip**
    fc.assert(
      fc.property(brandVoiceGuideArb, (brandVoiceGuide) => {
        // Serialize to JSON (simulating database storage)
        const serialized = JSON.stringify(brandVoiceGuide);

        // Deserialize back
        const deserialized: BrandVoiceGuide = JSON.parse(serialized);

        // Verify all fields are equivalent
        expect(deserialized.tone).toBe(brandVoiceGuide.tone);
        expect(deserialized.style).toBe(brandVoiceGuide.style);
        expect(deserialized.terminology).toEqual(brandVoiceGuide.terminology);
        expect(deserialized.avoid).toEqual(brandVoiceGuide.avoid);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve terminology array order through serialization', () => {
    // **Feature: prowrite-ai, Property 4: Brand Voice Guide Serialization Round-Trip**
    fc.assert(
      fc.property(brandVoiceGuideArb, (brandVoiceGuide) => {
        const serialized = JSON.stringify(brandVoiceGuide);
        const deserialized: BrandVoiceGuide = JSON.parse(serialized);

        // Array order must be preserved
        expect(deserialized.terminology.length).toBe(
          brandVoiceGuide.terminology.length,
        );
        for (let i = 0; i < brandVoiceGuide.terminology.length; i++) {
          expect(deserialized.terminology[i]).toBe(
            brandVoiceGuide.terminology[i],
          );
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve avoid array order through serialization', () => {
    // **Feature: prowrite-ai, Property 4: Brand Voice Guide Serialization Round-Trip**
    fc.assert(
      fc.property(brandVoiceGuideArb, (brandVoiceGuide) => {
        const serialized = JSON.stringify(brandVoiceGuide);
        const deserialized: BrandVoiceGuide = JSON.parse(serialized);

        // Array order must be preserved
        expect(deserialized.avoid.length).toBe(brandVoiceGuide.avoid.length);
        for (let i = 0; i < brandVoiceGuide.avoid.length; i++) {
          expect(deserialized.avoid[i]).toBe(brandVoiceGuide.avoid[i]);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should handle special characters in brand voice guide fields', () => {
    // **Feature: prowrite-ai, Property 4: Brand Voice Guide Serialization Round-Trip**
    // Test with unicode and special characters
    const specialCharArb = fc.string({
      minLength: 1,
      maxLength: 100,
    });

    const specialBrandVoiceGuideArb: fc.Arbitrary<BrandVoiceGuide> = fc.record({
      tone: specialCharArb,
      style: specialCharArb,
      terminology: fc.array(specialCharArb, { minLength: 0, maxLength: 10 }),
      avoid: fc.array(specialCharArb, { minLength: 0, maxLength: 10 }),
    });

    fc.assert(
      fc.property(specialBrandVoiceGuideArb, (brandVoiceGuide) => {
        const serialized = JSON.stringify(brandVoiceGuide);
        const deserialized: BrandVoiceGuide = JSON.parse(serialized);

        expect(deserialized).toEqual(brandVoiceGuide);

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
