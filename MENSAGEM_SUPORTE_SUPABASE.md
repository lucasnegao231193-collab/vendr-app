# 📧 MENSAGEM PARA O SUPORTE DO SUPABASE

## 🔗 Onde enviar:
https://supabase.com/dashboard/support

---

## 📋 COPIE E COLE ESTA MENSAGEM:

**Subject:** Unable to create new users - "Database error saving new user"

**Message:**

Hello Supabase Support Team,

I'm experiencing a critical issue with user authentication in my project. I'm unable to create new users through any method, and I need your help to resolve this.

**Project Details:**
- Project URL: https://hjdbrxnemxiojcfxwcjd.supabase.co
- Organization: lucasnegao231193@gmail.com's Org
- Environment: Production

**Problem:**
When trying to create new users, I consistently get the error:
```
AuthApiError: Database error saving new user
Status: 500
Code: unexpected_failure
```

**What I've tried:**
1. ✅ Using `auth.signUp()` - Failed
2. ✅ Using `auth.admin.createUser()` with service role - Failed
3. ✅ Disabled "Confirm email" setting - Still fails
4. ✅ Checked RLS policies on empresas and perfis tables - Disabled
5. ✅ Verified SERVICE_ROLE_KEY is correctly configured
6. ✅ Tested with multiple different email addresses

**Current Status:**
- Existing users: 8 users in the system
- Plan: Free tier
- All existing users can login successfully
- Only NEW user creation fails

**Error Details:**
The error occurs at the Supabase Auth level, before any of my application code runs. The error message suggests a database-level issue, but I don't have permissions to investigate auth.users table directly.

**Request:**
Could you please:
1. Check if there's any block or limit on my project preventing new user creation
2. Verify if there are any failed triggers or constraints on auth.users table
3. Check if there's any configuration issue with my project's Auth settings
4. Let me know if there's anything else I should check

This is blocking my application's user registration completely. Any help would be greatly appreciated!

Thank you!

---

**Additional Information:**
- The issue started happening consistently
- No recent changes to Supabase configuration
- Service role key is working for database operations
- Only Auth operations are failing

