# Pre-deploy Checklist — Countries Marble Race

## Build Quality
- [ ] `npm run build` success, không lỗi
- [ ] `dist/` không quá 10MB (game HTML5)
- [ ] Assets compressed (texture atlas, sprites, audio)
- [ ] Source maps tắt trong production build (`sourcemap: false`)
- [ ] Console log đã loại bỏ (`drop_console: true`)
- [ ] Build size checkpoint < 500KB warning

## PWA
- [ ] Manifest đúng `start_url`, `display: fullscreen`
- [ ] Icon 192×192 + 512×512 tồn tại trong `public/`
- [ ] Service worker cached toàn bộ game assets
- [ ] Lighthouse PWA ≥ 90

## Performance
- [ ] FPS ≥ 58 desktop (mượt mà)
- [ ] FPS ≥ 30 mobile
- [ ] Game load < 3s trên 3G (emulate Slow 3G)
- [ ] Memory: không leak sau 5 phút chơi

## Quality
- [ ] Không console error / warning
- [ ] Touch controls hoạt động (mobile)
- [ ] Keyboard controls hoạt động (desktop)
- [ ] Audio play khi user interaction đầu tiên
- [ ] Responsive: 960×540, 375×667, 1024×768, 1920×1080

## Deploy target
- [ ] **GitHub Pages**: repo Settings → Pages → Source: GitHub Actions
- [ ] **Itch.io**: thêm `BUTLER_API_KEY`, `ITCH_USER`, `ITCH_GAME` vào GitHub Secrets
- [ ] **Vercel/Netlify**: kết nối GitHub repo + build command: `npm run build`

## Git
- [ ] Code đã được review
- [ ] QA đã pass
- [ ] Git status sạch (không file chưa commit)
- [ ] Tag version đã tạo (nếu release)
