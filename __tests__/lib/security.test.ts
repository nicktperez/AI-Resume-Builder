import { 
  isValidEmail, 
  validatePasswordStrength, 
  sanitizeInput,
  checkIPRateLimit 
} from '../../lib/security';

describe('Security utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@subdomain.example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('a'.repeat(255) + '@example.com')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject weak passwords', () => {
      expect(validatePasswordStrength('1234567')).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long'
      });

      expect(validatePasswordStrength('password')).toEqual({
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      });

      expect(validatePasswordStrength('PASSWORD')).toEqual({
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      });

      expect(validatePasswordStrength('Password')).toEqual({
        isValid: false,
        message: 'Password must contain at least one number'
      });

      expect(validatePasswordStrength('a'.repeat(129))).toEqual({
        isValid: false,
        message: 'Password must be less than 128 characters'
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize input correctly', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('')).toBe('');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(15000);
      const result = sanitizeInput(longInput);
      expect(result.length).toBe(10000);
    });
  });

  describe('checkIPRateLimit', () => {
    beforeEach(() => {
      // Clear any existing rate limit data
      jest.clearAllMocks();
    });

    it('should allow requests within limit', () => {
      const ip = '192.168.1.1';
      expect(checkIPRateLimit(ip, 5, 1000)).toBe(true);
      expect(checkIPRateLimit(ip, 5, 1000)).toBe(true);
      expect(checkIPRateLimit(ip, 5, 1000)).toBe(true);
    });

    it('should block requests over limit', () => {
      const ip = '192.168.1.2';
      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        expect(checkIPRateLimit(ip, 5, 1000)).toBe(true);
      }
      // 6th request should be blocked
      expect(checkIPRateLimit(ip, 5, 1000)).toBe(false);
    });
  });
});
