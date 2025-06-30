## authService.js

### 1. Login Function

1. Validates email and password from request body
2. Finds user in MongoDB by email
3. Compares password using bcrypt
4. Create accessToken and refreshToken and save to DB if credentials valid
5. Generates JWT token pair
6. Returns user data (without password) and token
7. Handles errors: user not found, invalid password, server errors
8. Uses express-validator for input validation
9. Includes rate limiting protection

### 2. Logout Function

1. Extract JWT token from request headers
2. Validate and decode JWT token
3. Remove refresh token from database
4. Add token to blacklist
5. Clear HTTP-only cookies
6. Log security event
7. Return success response

### 3. Register Function

1. Validate registration data
2. Check if user already exists
3. Hash password with bcrypt
4. Create user record in database
5. Generate email verification token
6. Send verification email
7. Return registration success response
8. Handle registration errors

### 4. Refresh Token Function

1. Extract refresh token from request
2. Verify refresh token signature
3. Find refresh token in database
4. Validate token metadata
5. Generate new access token
6. Optionally rotate refresh token
7. Return new tokens
8. Handle refresh token errors

### 5. Forgot Password Function

1. Validate email input
2. Find user by email
3. Generate password reset token
4. Store reset token in database
5. Send password reset email
6. Return consistent response
7. Clean up expired tokens

### 6. Reset Password Function

1. Validate reset token and new password
2. Find and verify reset token
3. Update user password
4. Invalidate all user sessions
5. Log security event
6. Send confirmation email
7. Return success response

### 7. Change Password Function

1. Authenticate user
2. Validate password inputs
3. Verify current password
4. Update to new password
5. Invalidate other sessions (optional)
6. Log password change event
7. Return success confirmation

### 8. Email Verification Function

1. Extract verification token
2. Find and verify token
3. Update user verification status
4. Clean up expired tokens
5. Log verification event
6. Return verification success
7. Handle verification errors

## userService.js

### 1. Get User Profile Function

1. Authenticate user from JWT token[^1]
2. Query user information from MongoDB by userId[^1]
3. Remove sensitive information (password, resetToken)[^1]
4. Return complete profile information[^1]
5. Handle errors: user not found, database errors[^1]
6. Log profile access activity[^1]
7. Apply rate limiting for endpoint[^1]

### 2. Update User Profile Function

1. Authenticate profile ownership (only user or admin)[^1]
2. Validate input data (email format, phone number)[^1]
3. Check if new email conflicts with other users[^1]
4. Update information in MongoDB[^1]
5. Send email notification for information changes[^1]
6. Log profile update activity[^1]
7. Return updated information (without password)[^1]

### 3. Get All Users Function (Admin)

1. Authenticate admin permissions[^1]
2. Support pagination (page, limit)[^1]
3. Support search by email, name[^1]
4. Support filtering by role, status[^1]
5. Sort by createdAt, lastLogin[^1]
6. Remove sensitive information from results[^1]
7. Return metadata (total, currentPage, totalPages)[^1]

### 4. Get User By ID Function (Admin)

1. Authenticate admin permissions[^1]
2. Validate ObjectId format[^1]
3. Query user by ID from database[^1]
4. Include detailed information (roles, permissions)[^1]
5. Remove password and sensitive data[^1]
6. Log admin access activity[^1]
7. Handle user not found errors[^1]

### 5. Update User By Admin Function

1. Authenticate admin permissions[^1]
2. Validate update data[^1]
3. Check if target user exists[^1]
4. Update role, status, permissions[^1]
5. Send email notification to affected user[^1]
6. Log admin modification activity[^1]
7. Return updated user data[^1]

### 6. Delete User Function (Admin)

1. Authenticate admin permissions[^1]
2. Check user is not the last admin[^1]
3. Soft delete (mark deleted: true)[^1]
4. Invalidate all user tokens[^1]
5. Send account deactivation email notification[^1]
6. Log user deletion activity[^1]
7. Cleanup related data (sessions, tokens)[^1]

### 7. Search Users Function

1. Authenticate access permissions[^1]
2. Validate search parameters[^1]
3. Search across multiple fields (name, email)[^1]
4. Support fuzzy search and exact match[^1]
5. Apply filters and sorting[^1]
6. Paginate results[^1]
7. Return formatted search results[^1]

## tokenService.js

### 1. Generate JWT Token Pair Function

1. Create access token with payload (userId, email, role)[^2]
2. Create refresh token with longer expiration[^2]
3. Save refresh token to database with metadata[^2]
4. Set appropriate expiration times[^2]
5. Include token fingerprint for security[^2]
6. Log token generation event[^2]
7. Return token pair with expiration info[^2]

### 2. Verify Access Token Function

1. Check token format and signature[^2]
2. Decode payload and validate claims[^2]
3. Check token expiration[^2]
4. Verify token is not blacklisted[^2]
5. Validate user is still active in database[^2]
6. Check token fingerprint if available[^2]
7. Return decoded payload or throw error[^2]

### 3. Verify Refresh Token Function

1. Validate refresh token signature[^2]
2. Find refresh token in database[^2]
3. Check expiration and status[^2]
4. Verify token ownership[^2]
5. Check token is not revoked[^2]
6. Validate associated user is still active[^2]
7. Return token metadata and user info[^2]

### 4. Refresh Access Token Function

1. Verify refresh token validity[^2]
2. Generate new access token[^2]
3. Optionally rotate refresh token[^2]
4. Update token metadata in database[^2]
5. Blacklist old access token if needed[^2]
6. Log token refresh event[^2]
7. Return new token pair[^2]

### 5. Revoke Token Function

1. Validate token to revoke[^2]
2. Add token to blacklist database[^2]
3. Remove refresh token from storage[^2]
4. Update token status to revoked[^2]
5. Log token revocation event[^2]
6. Notify user about security action[^2]
7. Cleanup expired blacklisted tokens[^2]

### 6. Revoke All User Tokens Function

1. Find all user tokens[^2]
2. Add all access tokens to blacklist[^2]
3. Remove all refresh tokens[^2]
4. Update user's tokenVersion[^2]
5. Log mass token revocation[^2]
6. Send security notification email[^2]
7. Force logout on all devices[^2]

### 7. Generate Password Reset Token Function

1. Generate secure random token[^2]
2. Set expiration time (usually 1 hour)[^2]
3. Hash token before saving to database[^2]
4. Associate with user account[^2]
5. Cleanup expired reset tokens[^2]
6. Log reset token generation[^2]
7. Return plain token for email sending[^2]

### 8. Verify Password Reset Token Function

1. Hash incoming token[^2]
2. Find matching token in database[^2]
3. Check expiration time[^2]
4. Verify token has not been used[^2]
5. Validate associated user is active[^2]
6. Mark token as used after verification[^2]
7. Return user info if valid[^2]

## emailService.js

### 1. Send Welcome Email Function

1. Load welcome email template[^3]
2. Personalize with user name and details[^3]
3. Include account activation link if needed[^3]
4. Format HTML and text versions[^3]
5. Send via configured email provider[^3]
6. Log email sending attempt[^3]
7. Handle delivery failures and retries[^3]

### 2. Send Email Verification Function

1. Generate verification token[^3]
2. Create verification URL with token[^3]
3. Load email verification template[^3]
4. Personalize email content[^3]
5. Send verification email[^3]
6. Log verification email sent[^3]
7. Set up retry mechanism for failures[^3]

### 3. Send Password Reset Email Function

1. Receive reset token and user email[^3]
2. Create password reset URL[^3]
3. Load password reset template[^3]
4. Include security warnings[^3]
5. Set email expiration notice[^3]
6. Send formatted email[^3]
7. Log password reset email activity[^3]

### 4. Send Password Changed Notification Function

1. Load password change notification template[^3]
2. Include timestamp and IP address[^3]
3. Add security recommendations[^3]
4. Provide contact info if not user action[^3]
5. Send notification email[^3]
6. Log security notification sent[^3]
7. Handle email delivery status[^3]

### 5. Send Account Locked Notification Function

1. Create account security alert[^3]
2. Include lock reason and timestamp[^3]
3. Provide unlock instructions[^3]
4. Add security contact information[^3]
5. Format urgent notification email[^3]
6. Send high-priority email[^3]
7. Log security incident notification[^3]

### 6. Send Login Alert Function

1. Detect unusual login patterns[^3]
2. Include login details (IP, device, location)[^3]
3. Provide quick account securing options[^3]
4. Add "not you?" action links[^3]
5. Format security alert email[^3]
6. Send real-time notification[^3]
7. Track alert email engagement[^3]

### 7. Send Account Deactivation Notice Function

1. Create account closure notification[^3]
2. Include deactivation reason[^3]
3. Provide data export options[^3]
4. Set account recovery timeframe[^3]
5. Add final security reminders[^3]
6. Send formal deactivation email[^3]
7. Log account lifecycle event[^3]

### 8. Send Bulk Notification Function

1. Validate bulk email recipients list[^3]
2. Personalize each email content[^3]
3. Implement rate limiting for bulk sends[^3]
4. Track delivery status for each email[^3]
5. Handle bounces and unsubscribes[^3]
6. Log bulk email campaign metrics[^3]
7. Provide delivery reports[^3]
