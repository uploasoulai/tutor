'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PROVIDERS } from '@/lib/ai/providers';

type SettingsResponse = {
  credential?: { configured?: boolean; providerId?: string };
  providers?: string[];
};

export function LearnerAiProviderSettings() {
  const [settings, setSettings] = useState<SettingsResponse>({ providers: [] });
  const [providerId, setProviderId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    const response = await fetch('/api/ai-settings', { cache: 'no-store' });
    const payload = await response.json();
    if (response.ok && payload.success) {
      setSettings(payload as SettingsResponse);
      if (!providerId && payload.credential?.providerId)
        setProviderId(payload.credential.providerId);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const testAndSave = async () => {
    setBusy(true);
    setMessage('正在测试连接…');
    try {
      const response = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, apiKey }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.error || '连接测试失败');
      setApiKey('');
      setMessage('连接成功，设置已安全保存，并用于 School Learning 与 Personal AI Tutor。');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '连接测试失败，凭证未保存。');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/ai-settings', { method: 'DELETE' });
      if (!response.ok) throw new Error('删除失败，请稍后重试。');
      setSettings({ ...settings, credential: { configured: false } });
      setApiKey('');
      setMessage('已移除个人 API Key；后续将按账户方案使用平台 AI。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败');
    } finally {
      setBusy(false);
    }
  };

  const providers = (settings.providers || []).map((id) => ({
    id,
    name: PROVIDERS[id as keyof typeof PROVIDERS]?.name || id,
  }));
  return (
    <section className="mx-auto w-full max-w-xl space-y-5">
      <div>
        <h3 className="text-base font-semibold">AI Provider Settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          设置一次后，个人 API Key 会安全用于 School Learning、Personal AI Tutor 和 Interactive
          Classroom。
        </p>
      </div>
      {providers.length ? (
        <>
          <label className="block space-y-2 text-sm font-medium">
            <span>Provider</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3"
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
            >
              <option value="" disabled>
                选择 AI Provider
              </option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>API Key</span>
            <Input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={settings.credential?.configured ? '输入新 Key 以更换' : '粘贴 API Key'}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            平台自动选择已验证的默认模型。Key 只保存在加密凭证库中，不会写入浏览器存储。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void testAndSave()}
              disabled={busy || !providerId || !apiKey.trim()}
            >
              {busy ? '请稍候…' : 'Test Connection'}
            </Button>
            {settings.credential?.configured && (
              <Button variant="outline" onClick={() => void remove()} disabled={busy}>
                移除 Key
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          当前没有完成 Personal AI Tutor 与 Interactive Classroom 双端验证的 Provider，因此个人 Key
          设置暂未开放。验证完成后，此处只需选择 Provider、粘贴 Key
          并测试连接。你仍可按账户方案使用平台 AI。
        </div>
      )}
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </section>
  );
}
