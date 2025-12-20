'use client';

import { useState, useEffect } from 'react';
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'search' | 'goldbox' | 'coupangpl' | 'recommendation' | 'deeplink'
  >('search');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search form state
  const [searchKeyword, setSearchKeyword] = useState('아이폰');
  const [searchLimit, setSearchLimit] = useState(10);
  const [searchImageSize, setSearchImageSize] = useState('230x230');

  // GoldBox form state
  const [goldboxSubId, setGoldboxSubId] = useState('');
  const [goldboxImageSize, setGoldboxImageSize] = useState('230x230');

  // CoupangPL form state
  const [coupangplLimit, setCoupangplLimit] = useState(20);
  const [coupangplSubId, setCoupangplSubId] = useState('');
  const [coupangplImageSize, setCoupangplImageSize] = useState('512x512');

  // Recommendation form state
  const [recommendationDeviceId, setRecommendationDeviceId] = useState('');
  const [recommendationSubId, setRecommendationSubId] = useState('');
  const [recommendationImageSize, setRecommendationImageSize] =
    useState('512x512');
  const [isMobile, setIsMobile] = useState(false);
  const [deviceIdMethod, setDeviceIdMethod] = useState<'auto' | 'manual'>(
    'auto'
  );

  // Deeplink form state
  const [deeplinkUrl, setDeeplinkUrl] = useState(
    'https://www.coupang.com/vp/products/1234567890'
  );
  const [deeplinkSubId, setDeeplinkSubId] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState<string | null>(null);

  // 디바이스 감지 및 Device ID 생성
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      setIsMobile(mobile);

      if (mobile) {
        // 모바일인 경우 실제 디바이스 ID 획득을 시도하지만, 웹에서는 제한적
        // 대신 localStorage 기반 UUID 생성
        let deviceId = localStorage.getItem('mobile_device_id');
        if (!deviceId) {
          deviceId = generateUUID();
          localStorage.setItem('mobile_device_id', deviceId);
        }
        setRecommendationDeviceId(deviceId);
      } else {
        // PC인 경우 브라우저 기반 고유 ID 생성
        let deviceId = localStorage.getItem('pc_device_id');
        if (!deviceId) {
          deviceId = generatePCDeviceId();
          localStorage.setItem('pc_device_id', deviceId);
        }
        setRecommendationDeviceId(deviceId);
      }
    };

    checkMobile();
  }, []);

  // UUID 생성 함수
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // PC용 디바이스 ID 생성 (브라우저 특성 기반)
  const generatePCDeviceId = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');

    // 간단한 해시 생성
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  // Device ID 재생성
  const regenerateDeviceId = () => {
    const key = isMobile ? 'mobile_device_id' : 'pc_device_id';
    localStorage.removeItem(key);

    const newDeviceId = isMobile ? generateUUID() : generatePCDeviceId();
    localStorage.setItem(key, newDeviceId);
    setRecommendationDeviceId(newDeviceId);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        keyword: searchKeyword,
        limit: searchLimit.toString(),
        imageSize: searchImageSize,
      });

      const res = await fetch(`/api/products/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoldBox = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        imageSize: goldboxImageSize,
      });

      if (goldboxSubId) {
        params.append('subId', goldboxSubId);
      }

      const res = await fetch(`/api/products/goldbox?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'GoldBox failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCoupangPL = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: coupangplLimit.toString(),
        imageSize: coupangplImageSize,
      });

      if (coupangplSubId) {
        params.append('subId', coupangplSubId);
      }

      const res = await fetch(`/api/products/coupangpl?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'CoupangPL failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        deviceId: recommendationDeviceId,
        imageSize: recommendationImageSize,
      });

      if (recommendationSubId) {
        params.append('subId', recommendationSubId);
      }

      const res = await fetch(`/api/products/recommendation?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Recommendation failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeeplink = async () => {
    setLoading(true);
    setError(null);
    setDeeplinkResult(null);
    try {
      const params = new URLSearchParams({
        url: deeplinkUrl,
      });

      if (deeplinkSubId) {
        params.append('subId', deeplinkSubId);
      }

      const res = await fetch(`/api/deeplink?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Deeplink generation failed');
      }

      // Deeplink는 배열 형태로 반환되므로 첫 번째 항목의 shortenUrl 추출
      if (
        data.rCode === '0' &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
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

    let products: Product[] = [];

    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data.productData) {
      products = response.data.productData;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={`${product.productId}-${index}`}
            className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <Image
              src={product.productImage}
              alt={product.productName}
              width={300}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold text-base mb-3 line-clamp-2 text-gray-800 leading-relaxed">
              {product.productName}
            </h3>
            <p className="text-xl font-bold text-blue-600 mb-3">
              ₩{product.productPrice?.toLocaleString() ?? 0}
            </p>
            <div className="flex gap-2 mb-4">
              {product.isRocket && (
                <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-lg font-medium">
                  로켓배송
                </span>
              )}
              {product.isFreeShipping && (
                <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-lg font-medium">
                  무료배송
                </span>
              )}
            </div>
            {product.categoryName && (
              <p className="text-base text-gray-600 mb-3 font-medium">
                카테고리: {product.categoryName}
              </p>
            )}
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-base font-medium"
            >
              상품 보기 →
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Coupang Partners SDK Test
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            {(
              [
                'search',
                'goldbox',
                'coupangpl',
                'recommendation',
                'deeplink',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-semibold text-base transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab === 'search' && '상품 검색'}
                {tab === 'goldbox' && 'GoldBox'}
                {tab === 'coupangpl' && 'CoupangPL'}
                {tab === 'recommendation' && '개인화 추천'}
                {tab === 'deeplink' && 'Deeplink'}
              </button>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {activeTab === 'search' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                상품 검색
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    검색 키워드
                  </label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="검색할 상품명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    결과 수
                  </label>
                  <input
                    type="number"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    이미지 크기
                  </label>
                  <select
                    value={searchImageSize}
                    onChange={(e) => setSearchImageSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="72x72">72x72</option>
                    <option value="120x120">120x120</option>
                    <option value="230x230">230x230</option>
                    <option value="300x300">300x300</option>
                    <option value="600x600">600x600</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchKeyword}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </div>
          )}

          {activeTab === 'goldbox' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">GoldBox</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Sub ID (선택사항)
                  </label>
                  <input
                    type="text"
                    value={goldboxSubId}
                    onChange={(e) => setGoldboxSubId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="통계용 Sub ID"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    이미지 크기
                  </label>
                  <select
                    value={goldboxImageSize}
                    onChange={(e) => setGoldboxImageSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="72x72">72x72</option>
                    <option value="120x120">120x120</option>
                    <option value="230x230">230x230</option>
                    <option value="300x300">300x300</option>
                    <option value="600x600">600x600</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGoldBox}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '로딩 중...' : 'GoldBox 상품 가져오기'}
              </button>
            </div>
          )}

          {activeTab === 'coupangpl' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                CoupangPL
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    결과 수
                  </label>
                  <input
                    type="number"
                    value={coupangplLimit}
                    onChange={(e) =>
                      setCoupangplLimit(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Sub ID (선택사항)
                  </label>
                  <input
                    type="text"
                    value={coupangplSubId}
                    onChange={(e) => setCoupangplSubId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="통계용 Sub ID"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    이미지 크기
                  </label>
                  <select
                    value={coupangplImageSize}
                    onChange={(e) => setCoupangplImageSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="230x230">230x230</option>
                    <option value="300x300">300x300</option>
                    <option value="512x512">512x512</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCoupangPL}
                disabled={loading}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '로딩 중...' : 'CoupangPL 상품 가져오기'}
              </button>
            </div>
          )}

          {activeTab === 'recommendation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                개인화 추천
              </h2>
              <div className="space-y-6">
                {/* Device ID 섹션 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Device ID 설정
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          isMobile
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isMobile ? '📱 모바일' : '💻 PC'}
                      </span>
                      <button
                        type="button"
                        onClick={regenerateDeviceId}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        🔄 새로 생성
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {isMobile
                        ? '📱 모바일 환경: 브라우저 기반 고유 ID가 자동 생성되었습니다.'
                        : '💻 PC 환경: 브라우저 특성 기반 고유 ID가 자동 생성되었습니다.'}
                    </p>
                    <p className="text-xs text-gray-500">
                      * 실제 앱에서는{' '}
                      {isMobile
                        ? 'ADID/GAID/IDFA'
                        : '브라우저 쿠키나 로그인 기반 ID'}
                      를 사용합니다.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deviceIdMethod"
                          value="auto"
                          checked={deviceIdMethod === 'auto'}
                          onChange={(e) =>
                            setDeviceIdMethod(
                              e.target.value as 'auto' | 'manual'
                            )
                          }
                          className="mr-2"
                        />
                        자동 생성 ID 사용
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deviceIdMethod"
                          value="manual"
                          checked={deviceIdMethod === 'manual'}
                          onChange={(e) =>
                            setDeviceIdMethod(
                              e.target.value as 'auto' | 'manual'
                            )
                          }
                          className="mr-2"
                        />
                        직접 입력
                      </label>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Device ID{' '}
                        {deviceIdMethod === 'manual'
                          ? '(직접 입력)'
                          : '(자동 생성)'}
                      </label>
                      <input
                        type="text"
                        value={recommendationDeviceId}
                        onChange={(e) =>
                          setRecommendationDeviceId(e.target.value)
                        }
                        disabled={deviceIdMethod === 'auto'}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          deviceIdMethod === 'auto'
                            ? 'bg-gray-50 text-gray-700 cursor-not-allowed'
                            : 'text-gray-900 bg-white'
                        }`}
                        placeholder={
                          deviceIdMethod === 'manual'
                            ? 'ADID, GAID 또는 IDFA 입력'
                            : '자동 생성된 ID'
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Sub ID (선택사항)
                    </label>
                    <input
                      type="text"
                      value={recommendationSubId}
                      onChange={(e) => setRecommendationSubId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="통계용 Sub ID"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      이미지 크기
                    </label>
                    <select
                      value={recommendationImageSize}
                      onChange={(e) =>
                        setRecommendationImageSize(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="230x230">230x230</option>
                      <option value="300x300">300x300</option>
                      <option value="512x512">512x512</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRecommendation}
                disabled={loading || !recommendationDeviceId}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '로딩 중...' : '개인화 추천 상품 가져오기'}
              </button>
            </div>
          )}

          {activeTab === 'deeplink' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Deeplink 생성
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Deeplink란?</strong> 쿠팡 상품 URL을 제휴 링크로
                  변환합니다.
                </p>
                <p className="text-xs text-gray-600">
                  * 일반 쿠팡 상품 URL을 입력하면 수수료를 받을 수 있는 제휴
                  링크가 생성됩니다.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    쿠팡 상품 URL
                  </label>
                  <input
                    type="text"
                    value={deeplinkUrl}
                    onChange={(e) => setDeeplinkUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://www.coupang.com/vp/products/1234567890"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Sub ID (선택사항)
                  </label>
                  <input
                    type="text"
                    value={deeplinkSubId}
                    onChange={(e) => setDeeplinkSubId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="통계용 Sub ID"
                  />
                </div>
              </div>
              <button
                onClick={handleDeeplink}
                disabled={loading || !deeplinkUrl}
                className="w-full bg-indigo-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '생성 중...' : 'Deeplink 생성'}
              </button>

              {deeplinkResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-3">
                    생성된 Deeplink
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <a
                      href={deeplinkResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all text-sm"
                    >
                      {deeplinkResult}
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(deeplinkResult);
                      alert('링크가 클립보드에 복사되었습니다!');
                    }}
                    className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    📋 링크 복사
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <strong className="text-lg">Error:</strong>{' '}
            <span className="text-base">{error}</span>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                API 응답 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div>
                  <span className="font-semibold text-gray-800">
                    응답 코드:
                  </span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-lg text-sm font-medium ${
                      response.rCode === '0'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {response.rCode}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">메시지:</span>
                  <span className="ml-2 text-gray-700">
                    {response.rMessage}
                  </span>
                </div>
                {response.data &&
                  !Array.isArray(response.data) &&
                  response.data.landingUrl && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-800">
                        랜딩 URL:
                      </span>
                      <a
                        href={response.data.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:underline text-base"
                      >
                        {response.data.landingUrl}
                      </a>
                    </div>
                  )}
              </div>
            </div>

            {response.rCode === '0' && activeTab !== 'deeplink' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-bold mb-6 text-gray-800">
                  상품 목록
                  <span className="text-base text-gray-600 ml-2 font-medium">
                    (
                    {Array.isArray(response.data)
                      ? response.data.length
                      : response.data?.productData?.length || 0}
                    개)
                  </span>
                </h3>
                {renderProducts()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
