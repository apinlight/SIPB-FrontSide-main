# Frontend Fixes - Quick Implementation Guide

**Status:** ✅ Verified with Backend Cross-Reference  
**Total Real Issues:** 7 (down from 10 - 3 were false positives)

---

## 🔴 CRITICAL: Fix API Client Imports (Est. 1 hour)

**THE PROBLEM:** 3 files use deprecated session-based authentication instead of token-based authentication, causing 401 errors on approve/reject actions.

**Files to Fix:**

### 1. `src/pages/shared/PenggunaanBarang.vue` (Line 62)

```javascript
// ❌ WRONG (line 62):
import API from '@/lib/api';

// ✅ CORRECT:
import { apiClient } from '@/lib/api';

// Then update all API calls in the file:
// ❌ WRONG:
await API.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/approve`)

// ✅ CORRECT:
await apiClient.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/approve`)
```

### 2. `src/pages/PengadaanBarang.vue` (Line 27)

```javascript
// ❌ WRONG (line 27):
import API from '@/lib/api';

// ✅ CORRECT:
import { apiClient } from '@/lib/api';

// Update all API.* calls to apiClient.*
```

### 3. `src/stores/penggunaanBarangStore.js` (Line 4)

```javascript
// ❌ WRONG (line 4):
import API from '@/lib/api';

// ✅ CORRECT:
import { apiClient } from '@/lib/api';

// Update all API.get/post/put/delete calls to apiClient.get/post/put/delete
```

**Test After Fix:**
- [ ] Login as admin/manager
- [ ] Go to Penggunaan Barang page
- [ ] Click "Approve" on an item
- [ ] Should see success toast (not 401 error)
- [ ] Click "Reject" on an item
- [ ] Should see success toast (not 401 error)

---

## 🟠 HIGH: Standardize Loading State (Est. 1 hour)

**THE PROBLEM:** `penggunaanBarangStore.js` uses `isLoading` while all other stores use `loading`, causing components to not show spinners correctly.

**File to Fix:** `src/stores/penggunaanBarangStore.js`

```javascript
// ❌ WRONG:
state: () => ({
  isLoading: true,
  // ...
})

// ✅ CORRECT:
state: () => ({
  loading: false,  // Match all other stores
  // ...
})

// Update all references:
// ❌ this.isLoading = true;
// ✅ this.loading = true;
```

**Update Components:**

Find all components that use this store:

```javascript
// ❌ WRONG:
const { isLoading } = storeToRefs(penggunaanBarangStore);

// ✅ CORRECT:
const { loading } = storeToRefs(penggunaanBarangStore);
```

**Test After Fix:**
- [ ] Loading spinner appears when fetching penggunaan barang
- [ ] Loading spinner appears during approve/reject

---

## 🟠 HIGH: Add Null Safety (Est. 1 hour)

**THE PROBLEM:** Templates access nested properties that might be null/undefined, causing crashes.

**Common Patterns to Fix:**

### In Templates:

```vue
<!-- ❌ WRONG: Will crash if penggunaan.barang is null -->
<td>{{ penggunaan.barang.nama_barang }}</td>

<!-- ✅ CORRECT: Safe with optional chaining -->
<td>{{ penggunaan.barang?.nama_barang || 'N/A' }}</td>
```

### In Scripts:

```javascript
// ❌ WRONG:
const branchName = user.branch_name;

// ✅ CORRECT:
const branchName = user?.branch_name || 'N/A';
```

**Files to Check:**
- All Vue files in `src/pages/`
- All components that display user data
- All components that display nested object data

**Test After Fix:**
- [ ] No "Cannot read property of undefined" errors in console
- [ ] Pages display "N/A" instead of crashing

---

## 🟠 HIGH: Improve Error Handling (Est. 1-2 hours)

**THE PROBLEM:** Some API calls don't handle errors properly or show generic messages.

**Pattern to Apply Everywhere:**

```javascript
// ✅ CORRECT pattern:
const handleApprove = async (penggunaan) => {
  try {
    const response = await apiClient.post(
      `/penggunaan-barang/${penggunaan.id_penggunaan}/approve`
    );
    
    toast.success('Berhasil menyetujui penggunaan barang');
    await penggunaanBarangStore.fetchPenggunaanBarang();
    
  } catch (err) {
    // Extract backend error message
    const message = err.response?.data?.message || 'Gagal menyetujui penggunaan barang';
    toast.error(message);
    logger.error('Approve failed:', err);
  }
};
```

**Key Changes:**
1. Always extract `err.response?.data?.message` for backend errors
2. Provide specific fallback messages (not just "Gagal")
3. Always log errors with `logger.error()`
4. Show specific success messages

**Files to Update:**
- All files with approve/reject handlers
- All store files with API calls
- Any component that makes direct API calls

---

## 🟡 MEDIUM: Add Request Debouncing (Est. 30 min)

**THE PROBLEM:** Search inputs make API calls on every keystroke.

**Solution:**

```javascript
import { debounce } from 'lodash-es';  // Or implement custom debounce

// Wrap fetch calls in debounce:
const debouncedFetch = debounce(() => {
  pengajuanStore.fetchPengajuan();
}, 300);  // Wait 300ms after last keystroke

watch(filterQuery, () => {
  debouncedFetch();
});
```

**Files to Update:**
- Any component with search/filter inputs
- Check: PengajuanTable.vue, BarangTable.vue, etc.

---

## 🟡 MEDIUM: Improve Toast Messages (Est. 30 min)

**THE PROBLEM:** Messages like "Gagal memuat data" don't tell users what data or why.

**Pattern:**

```javascript
// ❌ WRONG:
toast.error('Gagal memuat data');

// ✅ CORRECT:
const message = err.response?.data?.message || 'Gagal memuat data penggunaan barang';
toast.error(message);
```

**Apply to all toast.error() calls.**

---

## 🟡 MEDIUM: Fix Logout Cleanup (Est. 30 min)

**THE PROBLEM:** Logout only clears user store, other stores retain old data.

**File:** `src/stores/userStore.js`

```javascript
import { getActivePinia } from 'pinia';

// In logout action:
async logout() {
  try {
    await apiClient.post('/logout');
  } catch (error) {
    logger.error('Logout error:', error);
  } finally {
    this.clearAuthData();
    
    // Clear all other stores
    const pinia = getActivePinia();
    if (pinia) {
      pinia._s.forEach(store => {
        if (store.$id !== 'user') {  // Don't reset user store twice
          store.$reset();
        }
      });
    }
    
    router.push({ name: 'Login' });
  }
}
```

---

## ✅ NO ISSUE FOUND (False Positives)

These were **incorrectly** identified in the initial analysis:

### ❌ FALSE: "Inconsistent API Response Handling"
- **Truth:** Backend intentionally returns TWO formats (Laravel Resources & custom JSON)
- **Verification:** Checked all controllers and resources - both patterns are correct
- **No fix needed**

### ❌ FALSE: "Token Validation Endpoint Missing"
- **Truth:** `/profile` endpoint DOES exist in `routes/api.php` line 23
- **Verification:** Read backend code - endpoint is correctly implemented
- **No fix needed**

### ❌ FALSE: "Router Guard Timing Issues"
- **Truth:** Router guards work correctly as implemented
- **Verification:** Logic properly checks auth state before routing
- **No fix needed**

---

## 📋 Testing Checklist (After All Fixes)

### Critical Functionality:
- [ ] Login with valid credentials
- [ ] Approve penggunaan barang (should show success, not 401)
- [ ] Reject penggunaan barang (should show success, not 401)
- [ ] Approve pengadaan barang
- [ ] All API calls show loading spinners

### Error Handling:
- [ ] Network failure shows helpful error message
- [ ] Invalid data shows backend error message
- [ ] No generic "Gagal memuat data" messages

### Performance:
- [ ] Search doesn't spam API (debounced)
- [ ] No console errors on normal usage
- [ ] Pages load without crashing

### Data Safety:
- [ ] No "Cannot read property of undefined" errors
- [ ] Missing data shows "N/A" instead of crashing
- [ ] Logout clears all user data

---

## 🎯 Implementation Order

**Day 1 (Critical):**
1. Fix API client imports (3 files) - 1 hour
2. Standardize loading state - 1 hour
3. Test approve/reject functionality - 30 min

**Day 2 (High Priority):**
4. Add null safety everywhere - 1 hour
5. Improve error handling - 2 hours
6. Test error scenarios - 30 min

**Day 3 (Medium Priority):**
7. Add debouncing - 30 min
8. Improve toast messages - 30 min
9. Fix logout cleanup - 30 min
10. Final testing - 1 hour

**Total Estimated Time:** ~8-9 hours

---

## 💡 Quick Command Reference

### Find Files to Fix:

```bash
# Find files using wrong API import:
grep -r "import API from '@/lib/api'" src/

# Find isLoading usage:
grep -r "isLoading" src/stores/

# Find generic error messages:
grep -r "toast.error('Gagal" src/
```

### After Fixing:

```bash
# Format code:
npm run format

# Lint:
npm run lint

# Build:
npm run build
```

---

**Priority:** Start with the CRITICAL fix (API client imports) - this is blocking approve/reject functionality!

