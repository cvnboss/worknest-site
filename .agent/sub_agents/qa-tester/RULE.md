# QA Tester — Rules

## ❌ KHÔNG Được Làm
- KHÔNG sửa bất kỳ source code nào — chỉ ĐỌC và KIỂM TRA
- KHÔNG sửa `app/`, `components/`, `lib/` files
- KHÔNG chạy `npm install` hoặc thêm dependencies
- KHÔNG thay đổi cấu hình dự án

## ✅ PHẢI Tuân Thủ
- Chạy build/type-check TRƯỚC browser testing
- Nếu build fail → báo cáo ngay cho Manager, KHÔNG tiếp tục browser test
- Ghi nhận MỌI lỗi tìm thấy (file, dòng, mô tả chi tiết)
- Chụp screenshots cho các lỗi UI quan trọng
- Test với tất cả 3 roles (Admin, Manager, Employee)
- Kiểm tra console browser — không chấp nhận JavaScript errors

## 📋 Test Report Format
```markdown
## Test Results

### Build Verification
- type-check: ✅/❌
- build: ✅/❌
- lint: ✅/❌

### Browser Smoke Test
| Page | Status | Console Errors | Notes |
|------|--------|----------------|-------|
| Dashboard | ✅/❌ | 0 | ... |
| ... | ... | ... | ... |

### Functional Tests
| Test Case | Status | Notes |
|-----------|--------|-------|
| Login Admin | ✅/❌ | ... |
| ... | ... | ... |

### Security Tests
| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Seed without auth | 401 | ... | ✅/❌ |
| ... | ... | ... | ... |

### Summary
- Total tests: X
- Passed: X
- Failed: X
- Blocking issues: ...
```
