# HEARTBEAT.md

## 活跃定时任务

| 任务 | 脚本 | 定时规则 | 说明 |
|------|------|----------|------|
| 每日简报 | automations/scripts/daily-briefing.sh | 30 8 * * * | 生成每日摘要 |
| 夜间优化 | automations/scripts/self-optimize.sh | 0 2 * * * | 审计+低风险修复 |
| 文档更新 | automations/scripts/update-docs.sh | 0 23 * * * | 滚动更新系统文档 |
| 仓库备份 | automations/scripts/backup-repo.sh | 0 */6 * * * | 每6小时备份 |

## 最近执行状态

- **2026-04-07 12:00** backup-repo.sh ✅ 成功（已推送GitHub auto-backup分支）
- **2026-04-07 08:30** daily-briefing.sh ✅ 成功
- **2026-04-07 02:00** self-optimize.sh ⚠️ 得分 -38/100（异常偏低）
- **2026-04-06 23:00** update-docs.sh ✅ 成功

> ⚠️ 自我优化得分持续下降：79 → 51 → 14 → -38，需关注
> 📝 HEARTBEAT.md于2026-04-07 11:44手动更新（原本停滞于04-03）

## 文档

配置说明：`docs/AUTOMATIONS.md`
