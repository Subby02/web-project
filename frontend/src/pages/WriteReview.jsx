import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import './WriteReview.css';

export default function WriteReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    score: 5,
    title: '',
    comment: '',
  });

  // 인증 확인 및 상품 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError('상품 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 인증 확인
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        
        if (!authResponse.ok) {
          navigate('/login', { state: { from: { pathname: `/write-review?productId=${productId}` } } });
          return;
        }

        const authData = await authResponse.json();
        if (authData?.authenticated !== true) {
          navigate('/login', { state: { from: { pathname: `/write-review?productId=${productId}` } } });
          return;
        }

        // 상품 정보 가져오기
        const productResponse = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!productResponse.ok) {
          setError('상품을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const productData = await productResponse.json();
        setProduct(productData);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.comment.trim()) {
      setError('후기 내용을 입력해주세요.');
      return;
    }

    if (formData.title.trim().length < 2) {
      setError('제목은 최소 2자 이상 입력해주세요.');
      return;
    }

    if (formData.comment.trim().length < 10) {
      setError('후기 내용은 최소 10자 이상 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          score: formData.score,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '후기 작성에 실패했습니다.');
      }

      alert('후기가 작성되었습니다.');
      navigate(`/products/${productId}`);
    } catch (err) {
      setError(err.message || '후기 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="write-review-container">
        <div className="write-review-loading">로딩 중...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="write-review-container">
        <div className="write-review-error">{error}</div>
        <Link to="/mypage" className="write-review-back-link">마이페이지로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="write-review-container">
      <div className="write-review-wrapper">
        <div className="write-review-header">
          <h1>후기 작성</h1>
          <Link to={`/products/${productId}`} className="write-review-close">✕</Link>
        </div>

        {product && (
          <div className="write-review-product-info">
            <h2>{product.name}</h2>
          </div>
        )}

        <form onSubmit={handleSubmit} className="write-review-form">
          <div className="write-review-form-group">
            <label htmlFor="score">평점</label>
            <div className="write-review-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`write-review-star ${formData.score >= star ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, score: star }))}
                >
                  ⭐
                </button>
              ))}
              <span className="write-review-score-text">{formData.score}점</span>
            </div>
            <input
              type="hidden"
              id="score"
              name="score"
              value={formData.score}
            />
          </div>

          <div className="write-review-form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="후기 제목을 입력해주세요"
              maxLength={100}
              required
            />
          </div>

          <div className="write-review-form-group">
            <label htmlFor="comment">후기 내용</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="상품에 대한 솔직한 후기를 작성해주세요. (최소 10자 이상)"
              rows={8}
              maxLength={1000}
              required
            />
            <div className="write-review-char-count">
              {formData.comment.length} / 1000자
            </div>
          </div>

          {error && <div className="write-review-error-message">{error}</div>}

          <div className="write-review-form-actions">
            <button
              type="button"
              className="write-review-cancel-button"
              onClick={() => navigate(`/products/${productId}`)}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="write-review-submit-button"
              disabled={submitting}
            >
              {submitting ? '작성 중...' : '후기 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

