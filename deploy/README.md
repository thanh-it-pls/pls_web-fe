# Deploy testing — pls_web-fe

Push lên `dev` → `Testing CD` build image Next.js (`output: "standalone"`) ngay trên GitHub runner với `NEXT_PUBLIC_API_URL=https://plstestapi.pls.edu.vn`, chạy thử `/health`, rồi `docker load` lên server testing `45.77.38.118` và chạy `scripts/deploy_testing.sh` (blue/green, đổi Nginx khi slot mới khỏe). Server không build Next.js.

Khác ICS FE (Flutter build ra file tĩnh, Nginx phục vụ trực tiếp): app này có trang render phía server (`/[[...slug]]` gọi API), nên phải chạy Node trong container.

| Mục | Giá trị |
| --- | --- |
| Domain | `https://plstest.pls.edu.vn` (CRM ở `/admin`, health ở `/health`) |
| API | `https://plstestapi.pls.edu.vn` (repo `pls_web_be`) |
| Thư mục server | `/root/pls_web_testing/frontend` (chỉ compose, nginx template, scripts, `.env`) |
| Cổng (chỉ 127.0.0.1) | blue `3050`, green `3051` |
| Nginx conf | `/etc/nginx/conf.d/plstest.pls.edu.vn.conf`, render từ `deploy/nginx/pls_web_frontend.testing*.conf` |
| Cert | wildcard `*.pls.edu.vn` ở `/etc/nginx/ssl/pls.edu.vn` |

## Việc cần làm một lần

1. DNS: bản ghi A `plstest.pls.edu.vn` → `45.77.38.118`.
2. Tạo branch `dev`.
3. GitHub → Settings → Secrets and variables → Actions → **Repository secrets** (https://github.com/thanh-it-pls/pls_web-fe/settings/secrets/actions), thêm `TESTING_SSH_PRIVATE_KEY` (cùng key với `pls_web_be`). Tuỳ chọn `TESTING_SSH_HOST` / `TESTING_SSH_PORT` / `TESTING_SSH_USER`.
4. Deploy BE trước: bước cuối của CD FE gọi `https://plstestapi.pls.edu.vn/health/ready`.

## Chạy thử local

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 -t pls-web-fe:local .
docker run --rm -p 3000:3000 pls-web-fe:local
```

## Rollback (trên server)

```bash
bash /root/pls_web_testing/frontend/scripts/rollback_testing.sh   # về slot trước (image cũ), vài giây
```
