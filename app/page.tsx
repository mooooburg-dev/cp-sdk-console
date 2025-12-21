'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName?: string;
  keyword?: string;
  rank?: number;
}

interface ApiResponse {
  rCode: string;
  rMessage: string;
  data?:
    | {
        landingUrl?: string;
        productData?: Product[];
      }
    | Product[];
}

// Minimal Icons for the new design
const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconBox = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
const IconStar = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLink = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

type TabType =
  | 'search'
  | 'goldbox'
  | 'coupangpl'
  | 'recommendation'
  | 'deeplink';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // States
  const [searchKeyword, setSearchKeyword] = useState('아이폰');
  const [searchLimit, setSearchLimit] = useState(10);
  const [searchImageSize, setSearchImageSize] = useState('230x230');
  const [goldboxSubId, setGoldboxSubId] = useState('');
  const [goldboxImageSize, setGoldboxImageSize] = useState('230x230');
  const [coupangplLimit, setCoupangplLimit] = useState(20);
  const [coupangplSubId, setCoupangplSubId] = useState('');
  const [coupangplImageSize, setCoupangplImageSize] = useState('512x512');
  const [recommendationDeviceId, setRecommendationDeviceId] = useState('');
  const [recommendationSubId, setRecommendationSubId] = useState('');
  const [recommendationImageSize, setRecommendationImageSize] =
    useState('512x512');
  const [deeplinkUrl, setDeeplinkUrl] = useState(
    'https://www.coupang.com/vp/products/1234567890'
  );
  const [deeplinkSubId, setDeeplinkSubId] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState<string | null>(null);

  // API Handlers (same logic as before)
  const handleAction = async (type: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (type === 'search') {
        endpoint = '/api/products/search';
        params.append('keyword', searchKeyword);
        params.append('limit', searchLimit.toString());
        params.append('imageSize', searchImageSize);
      } else if (type === 'goldbox') {
        endpoint = '/api/products/goldbox';
        params.append('imageSize', goldboxImageSize);
        if (goldboxSubId) params.append('subId', goldboxSubId);
      } else if (type === 'coupangpl') {
        endpoint = '/api/products/coupangpl';
        params.append('limit', coupangplLimit.toString());
        params.append('imageSize', coupangplImageSize);
        if (coupangplSubId) params.append('subId', coupangplSubId);
      } else if (type === 'recommendation') {
        endpoint = '/api/products/recommendation';
        params.append('deviceId', recommendationDeviceId);
        params.append('imageSize', recommendationImageSize);
        if (recommendationSubId) params.append('subId', recommendationSubId);
      } else if (type === 'deeplink') {
        endpoint = '/api/deeplink';
        params.append('url', deeplinkUrl);
        if (deeplinkSubId) params.append('subId', deeplinkSubId);
      }

      const res = await fetch(`${endpoint}?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (type === 'deeplink' && data.data?.[0]?.shortenUrl) {
        setDeeplinkResult(data.data[0].shortenUrl);
      }
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderProducts = () => {
    if (!response?.data) return null;
    const products = Array.isArray(response.data)
      ? response.data
      : response.data.productData || [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
        {products.map((p, i) => (
          <div
            key={i}
            className="tech-panel overflow-hidden group hover:border-primary/50 transition-standard"
          >
            <div className="relative h-40 bg-gray-800">
              <Image
                src={p.productImage}
                alt={p.productName}
                fill
                className="object-cover group-hover:scale-105 transition-standard"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {p.isRocket && (
                  <span className="tech-badge px-1.5 py-0.5 rounded">
                    Rocket
                  </span>
                )}
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-2 mb-2 text-gray-200">
                {p.productName}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold">
                  ₩{p.productPrice.toLocaleString()}
                </span>
                <a
                  href={p.productUrl}
                  target="_blank"
                  className="text-[10px] text-primary uppercase font-bold tracking-tighter border border-primary/30 px-2 py-1 rounded hover:bg-primary/10 transition-standard"
                >
                  View →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center py-12 px-6">
      {/* Header Container */}
      <header className="w-full max-w-5xl mb-12 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-full px-4 py-1 mb-6">
          <span className="text-primary text-xs font-bold tracking-widest leading-none">
            &gt; COUPANG PARTNERS API
          </span>
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
          SDK Test Console
        </h1>
        <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
          쿠팡 파트너스 API의 모든 기능을 테스트 결과를 실시간으로 확인하세요.
        </p>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl space-y-8">
        {/* Navigation Tabs */}
        <nav
          className="tech-panel p-1.5 flex flex-wrap gap-1 justify-center animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          {[
            { id: 'search', label: '상품 검색', icon: <IconSearch /> },
            { id: 'goldbox', label: '골드박스', icon: <IconBox /> },
            { id: 'coupangpl', label: 'CoupangPL', icon: <IconStar /> },
            { id: 'recommendation', label: '개인화 추천', icon: <IconUser /> },
            { id: 'deeplink', label: 'DeepLink', icon: <IconLink /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setResponse(null);
                setError(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-standard ${
                activeTab === tab.id
                  ? 'bg-input-dark text-white'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-primary' : ''}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Panel: Configuration */}
          <div
            className="tech-panel p-8 space-y-8 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-input-dark rounded-xl flex items-center justify-center text-primary border border-border-dark">
                {activeTab === 'search' && <IconSearch />}
                {activeTab === 'goldbox' && <IconBox />}
                {activeTab === 'coupangpl' && <IconStar />}
                {activeTab === 'recommendation' && <IconUser />}
                {activeTab === 'deeplink' && <IconLink />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {activeTab === 'search' && '상품 검색 설정'}
                  {activeTab === 'goldbox' && '골드박스 설정'}
                  {activeTab === 'coupangpl' && 'CoupangPL 설정'}
                  {activeTab === 'recommendation' && '개인화 추천 설정'}
                  {activeTab === 'deeplink' && 'DeepLink 생성'}
                </h2>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest opacity-80">
                  {activeTab === 'search' && '키워드 기반 상품 검색'}
                  {activeTab === 'goldbox' && '오늘의 골드박스 딜'}
                  {activeTab === 'coupangpl' && '쿠팡 PL 브랜드 상품'}
                  {activeTab === 'recommendation' &&
                    '사용자 맞춤형 정교한 추천'}
                  {activeTab === 'deeplink' && '제휴 링크로 즉시 변환'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === 'search' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      검색 키워드
                    </label>
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                      placeholder="아이폰"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        결과 개수
                      </label>
                      <input
                        type="number"
                        value={searchLimit}
                        onChange={(e) =>
                          setSearchLimit(parseInt(e.target.value))
                        }
                        className="tech-input w-full px-4 py-3 text-sm font-semibold"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        이미지 사이즈
                      </label>
                      <select
                        value={searchImageSize}
                        onChange={(e) => setSearchImageSize(e.target.value)}
                        className="tech-input w-full px-4 py-3 text-sm font-semibold appearance-none"
                      >
                        <option value="230x230">230px</option>
                        <option value="300x300">300px</option>
                        <option value="512x512">512px</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {/* Other tabs follow the same UI pattern */}
              {activeTab === 'goldbox' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      Sub ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={goldboxSubId}
                      onChange={(e) => setGoldboxSubId(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      이미지 사이즈
                    </label>
                    <select
                      value={goldboxImageSize}
                      onChange={(e) => setGoldboxImageSize(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                    >
                      <option value="230x230">230px</option>
                      <option value="300x300">300px</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === 'coupangpl' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        결과 개수
                      </label>
                      <input
                        type="number"
                        value={coupangplLimit}
                        onChange={(e) =>
                          setCoupangplLimit(parseInt(e.target.value))
                        }
                        className="tech-input w-full px-4 py-3 text-sm font-semibold"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        이미지 사이즈
                      </label>
                      <select
                        value={coupangplImageSize}
                        onChange={(e) => setCoupangplImageSize(e.target.value)}
                        className="tech-input w-full px-4 py-3 text-sm font-semibold"
                      >
                        <option value="230x230">230px</option>
                        <option value="512x512">512px</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      Sub ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={coupangplSubId}
                      onChange={(e) => setCoupangplSubId(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                    />
                  </div>
                </div>
              )}
              {activeTab === 'recommendation' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      Device ID
                    </label>
                    <input
                      type="text"
                      value={recommendationDeviceId}
                      onChange={(e) =>
                        setRecommendationDeviceId(e.target.value)
                      }
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                      placeholder="ADID / UUID"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        Sub ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={recommendationSubId}
                        onChange={(e) => setRecommendationSubId(e.target.value)}
                        className="tech-input w-full px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                        이미지 사이즈
                      </label>
                      <select
                        value={recommendationImageSize}
                        onChange={(e) =>
                          setRecommendationImageSize(e.target.value)
                        }
                        className="tech-input w-full px-4 py-3 text-sm font-semibold"
                      >
                        <option value="300x300">300px</option>
                        <option value="512x512">512px</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'deeplink' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      쿠팡 상품 URL
                    </label>
                    <textarea
                      rows={3}
                      value={deeplinkUrl}
                      onChange={(e) => setDeeplinkUrl(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                      Sub ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={deeplinkSubId}
                      onChange={(e) => setDeeplinkSubId(e.target.value)}
                      className="tech-input w-full px-4 py-3 text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => handleAction(activeTab)}
                disabled={loading}
                className="tech-button w-full py-4 text-sm flex justify-center items-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="opacity-70 font-mono tracking-tighter">
                      &gt;
                    </span>
                    API 실행
                  </>
                )}
              </button>

              {deeplinkResult && activeTab === 'deeplink' && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    제휴 링크 결과
                  </span>
                  <div className="bg-input-dark p-3 rounded-lg text-xs font-mono text-white break-all mb-4 border border-border-dark leading-relaxed">
                    {deeplinkResult}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(deeplinkResult);
                      alert('Copied!');
                    }}
                    className="w-full bg-input-dark text-primary border border-primary/30 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/10 transition-standard"
                  >
                    📋 링크 주소 복사
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Results */}
          <div
            className="tech-panel p-8 min-h-[500px] flex flex-col animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">실시간 결과</h2>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold border border-primary/30 text-primary bg-primary/5 uppercase tracking-widest">
                {response ? 'Success' : 'Ready'}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {error && (
                <div className="p-5 bg-red-900/10 border border-red-900/40 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Error Trace
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-red-200/80 leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {response ? (
                <div className="space-y-6">
                  {renderProducts()}
                  <details className="mt-8 group">
                    <summary className="list-none text-[10px] font-bold text-text-muted hover:text-white cursor-pointer transition-standard flex items-center gap-2 py-2">
                      <span className="group-open:rotate-90 transition-standard inline-block">
                        ▶
                      </span>{' '}
                      SHOW RAW JSON
                    </summary>
                    <pre className="mt-4 p-5 bg-input-dark rounded-xl text-[10px] font-mono text-primary/80 overflow-auto max-h-[300px] border border-border-dark leading-relaxed">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-input-dark rounded-2xl flex items-center justify-center mb-6 text-gray-500 border border-border-dark">
                    <IconSearch />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    준비되었습니다
                  </h3>
                  <p className="text-[10px] font-bold text-text-muted max-w-[200px] leading-relaxed">
                    설정을 완료하고 API 실행 버튼을 클릭하세요. 실시간 데이터가
                    여기에 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer
        className="mt-20 text-center animate-fade-in"
        style={{ animationDelay: '0.4s' }}
      >
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
          &copy; 2025 Coupang Partners SDK Test. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
