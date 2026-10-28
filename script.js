/**
 * ==========================================================================
 * 모아워크 (MOAWORK) 프리미엄 인터랙션 스크립트 (script.js)
 * - 도자기 마켓 감성의 부드러운 스크롤, 블러 헤더 인터랙션, 아코디언, 유효성 검사
 * 
 * [목차]
 * 1. 헤더 스크롤 감지 및 블러 효과 (Header Scrolled State)
 * 2. 모바일 햄버거 메뉴 토글 기능
 * 3. 상단 메뉴 및 버튼 부드러운 스크롤 이동
 * 4. FAQ 아코디언 펼침/닫힘 기능
 * 5. 문의 폼 필수 입력값 유효성 검사 (Validation)
 * 6. 검증 완료 안내 모달 제어
 * ==========================================================================
 */

// HTML 문서의 모든 요소가 안전하게 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     [1] 헤더 스크롤 감지 (도자기 마켓 감성의 은은한 블러 & 섀도우)
     -------------------------------------------------------------------------- */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* --------------------------------------------------------------------------
     [2] 모바일 네비게이션 햄버거 메뉴 열기/닫기
     -------------------------------------------------------------------------- */
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggleBtn && navMenu) {
    // 햄버거 버튼 클릭 이벤트
    mobileToggleBtn.addEventListener('click', () => {
      // active 클래스를 토글하여 메뉴를 열거나 닫습니다.
      const isOpen = navMenu.classList.toggle('active');
      mobileToggleBtn.classList.toggle('active');

      // 웹 접근성(스크린 리더)을 위한 상태값 갱신
      mobileToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // 모바일 메뉴 항목 중 하나를 클릭하면 메뉴 창을 자동으로 닫아줍니다.
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileToggleBtn.classList.remove('active');
          mobileToggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     [3] 부드러운 스크롤 이동 보조
     - CSS의 `scroll-behavior: smooth`와 연동되어 안정적으로 대상 섹션으로 이동합니다.
     -------------------------------------------------------------------------- */
  const smoothScrollTriggers = document.querySelectorAll('a[href^="#"]');

  smoothScrollTriggers.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // '#' 단독 링크가 아닐 때만 이동 로직 수행
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault(); // 기본 순간 이동 방지
          
          // 대상 요소의 위치로 부드럽게 스크롤
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // 브라우저 주소창 해시(#) 업데이트 (뒤로가기 지원)
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     [4] FAQ 아코디언 토글 기능
     - 질문(Question) 버튼 클릭 시 답변(Answer)의 높이를 조절하여 부드럽게 펼치고 접습니다.
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isCurrentlyActive = item.classList.contains('active');

        // 다른 열려 있는 FAQ 항목들을 닫아줍니다 (원페이지 깔끔 유지)
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question');
            const otherAns = otherItem.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        // 현재 클릭한 항목 상태 토글
        if (isCurrentlyActive) {
          // 이미 열려 있으면 닫기
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          // 닫혀 있으면 열기 (실제 내부 높이 scrollHeight를 계산하여 부드럽게 펼침)
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  /* --------------------------------------------------------------------------
     [5] 1:1 무료 상담 신청서 구글 스프레드시트 연동 및 제출 처리
     - 구글 앱스 스크립트(Google Apps Script) 웹 앱 URL로 데이터를 비동기(fetch) 전송합니다.
     - 전송 중 중복 클릭 방지(로딩 상태) 및 완료 후 안내 메시지와 폼 리셋을 수행합니다.
     -------------------------------------------------------------------------- */

  // ⭐ 구글 스프레드시트 Apps Script에서 발급받으신 실제 웹 앱 배포 URL입니다.
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJtqypi1gII308jGHm9060etdwHcp8X8F83LBxIbBuJwuNwGIadYe9NhZaNgtlIcOY7g/exec';

  // 상담 폼 및 내부 입력 필드 참조
  const consultForm = document.getElementById('consult-form');
  const brandNameInput = document.getElementById('brand-name');
  const contactPhoneInput = document.getElementById('contact-phone');
  const contactEmailInput = document.getElementById('contact-email');
  const inquiryMessageInput = document.getElementById('inquiry-message');

  // 제출 버튼 및 내부 텍스트/아이콘 참조 (로딩 상태 표시에 사용)
  const submitBtn = document.getElementById('submit-btn');
  const submitBtnText = document.getElementById('submit-btn-text');
  const submitBtnIcon = document.getElementById('submit-btn-icon');

  if (consultForm) {
    consultForm.addEventListener('submit', async (e) => {
      // 1. 브라우저의 기본 페이지 새로고침 동작을 중단합니다.
      e.preventDefault();

      // 2. 사용자가 입력한 값들을 가져옵니다.
      const brandName = brandNameInput ? brandNameInput.value.trim() : '';
      const contactPhone = contactPhoneInput ? contactPhoneInput.value.trim() : '';
      const contactEmail = contactEmailInput ? contactEmailInput.value.trim() : '';
      const inquiryMessage = inquiryMessageInput ? inquiryMessageInput.value.trim() : '';

      // 3. 다중 선택된 희망 서비스 항목들을 쉼표(,)로 묶어줍니다.
      const selectedServices = Array.from(
        document.querySelectorAll('input[name="services"]:checked')
      ).map(checkbox => checkbox.value).join(', ');

      // 4. 필수 입력값 검증 (대표자명 / 브랜드명, 연락처)
      if (!brandName) {
        alert('대표자명 또는 브랜드명을 입력해 주세요.');
        if (brandNameInput) brandNameInput.focus();
        return;
      }

      if (!contactPhone) {
        alert('연락처(전화번호)를 입력해 주세요.');
        if (contactPhoneInput) contactPhoneInput.focus();
        return;
      }

      // 5. 구글 시트로 보낼 데이터 객체 구성
      const formData = {
        brandName: brandName,
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        services: selectedServices || '선택 없음',
        inquiryMessage: inquiryMessage || '내용 없음'
      };

      // 6. 구글 스크립트 웹 앱 URL이 설정되어 있는지 확인합니다.
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        alert(
          '【안내】 구글 스프레드시트 연동 URL이 아직 설정되지 않았습니다.\n\n' +
          'script.js 파일의 141번째 줄 [GOOGLE_SCRIPT_URL]에\n' +
          '구글 Apps Script에서 발급받은 웹 앱 배포 URL을 입력해 주시면 즉시 시트에 저장됩니다!'
        );
        console.log('[미연동 상태에서 수집된 테스트 데이터]:', formData);
        return;
      }

      // 7. 버튼 로딩 상태로 변경 (중복 클릭 방지)
      if (submitBtn) {
        submitBtn.disabled = true;
      }
      if (submitBtnText) {
        submitBtnText.textContent = '신청서 접수 중입니다...';
      }
      if (submitBtnIcon) {
        submitBtnIcon.textContent = '⏳';
      }

      try {
        // 8. 구글 앱스 스크립트로 비동기 데이터 전송 (CORS 제약 없이 안전하게 전달)
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(formData)
        });

        // 9. 접수 완료 안내 알림창 표시
        alert('소중한 상담 신청이 성공적으로 접수되었습니다!\n대표가 24시간 내에 직접 검토 후 친절하게 연락드리겠습니다. 🚀');

        // 10. 입력 폼 초기화
        consultForm.reset();

      } catch (error) {
        console.error('구글 시트 전송 중 오류 발생:', error);
        alert('접수 처리 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');

      } finally {
        // 11. 버튼 상태 원상태로 복구
        if (submitBtn) {
          submitBtn.disabled = false;
        }
        if (submitBtnText) {
          submitBtnText.textContent = '무료 상담 신청서 접수하기';
        }
        if (submitBtnIcon) {
          submitBtnIcon.textContent = '🚀';
        }
      }
    });
  }

});
