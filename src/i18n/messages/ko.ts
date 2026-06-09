/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defaultLocaleTranslations, sceneCopyToMessages } from '../../config/defaultLocaleTranslations';
import type { MessageCatalog } from '../types';

const localeBundle = defaultLocaleTranslations.ko;

export const ko: MessageCatalog = {
  meta: {
    title: 'G.trans | 시네마틱 체험',
    description: 'G.trans 시네마틱 체험 — 매끄러운 글로벌 커뮤니케이션',
  },
  common: {
    manage: '관리',
    closeLab: 'Lab 닫기',
    cinematicLab: 'Cinematic Lab',
    soundOn: '사운드: ON',
    soundOff: '사운드: OFF',
    bgmOn: 'BGM: ON',
    bgmOff: 'BGM: OFF',
    sfxOn: '효과음: ON',
    sfxOff: '효과음: OFF',
    prev: '← 이전',
    next: '다음 →',
    goToScene: '씬 {n}으로',
    scrollHint: '스크롤하거나 다음을 클릭하여 이동',
    sceneLabel: '씬 {n}',
    latency: '지연: 4ms',
    downloadAlert:
      'G.trans 클라이언트 다운로드 감사합니다. 설치 패키지(72.4MB)를 시작합니다.',
    language: '언어',
  },
  logo: {
    sublabel: 'Translation tool',
  },
  loading: {
    title: 'G.trans',
    status: '시네마틱 체험을 준비하고 있습니다…',
    progressLabel: 'Loading',
  },
  toolbar: {
    sectionLabel: 'G.trans 툴바',
    clickToDemo: 'Click to Demo',
    rangeTranslation: '범위 번역',
    utteranceTranslation: '발언 번역',
  },
  utterance: {
    panelTitle: '발언 번역 → {language}',
    placeholder: '전하고 싶은 내용을 입력...',
    copiedToClipboard: '클립보드에 복사됨',
    clickToSend: 'Click to Send',
    sendMessage: '메시지 보내기',
    closePanel: '발언 패널 닫기',
  },
  gaming: {
    tacticalSync: 'Tactical Translation Sync',
    realtimeSpeed: 'REALTIME CLIENT SPEED: 0.003s',
    chatPlaceholder: '메시지 입력 (영어, 일본어, 한국어, 스페인어...)',
    liveServer: 'Live Server Lobby // Raid Room B',
    online: '98,241 ONLINE',
    playerUsername: 'You_The_Player',
  },
  voice: {
    listening: '음성 주파수 분석 중...',
    processing: '음성 벡터 복호화 및 번역 중...',
    doneQuote:
      '"안녕하세요, 전 세계의 친구들. 마찰 없이 아름다운 것을 함께 만들어 봅시다."',
    reset: '시뮬레이션 리셋',
    offline: '음성 시뮬레이터 오프라인',
  },
  discovery: {
    hoverHint: '간판에 마우스를 올려 번역',
  },
  connection: {
    syncActive: 'GLOBAL SYNC ACTIVE',
  },
  finalCta: { ...localeBundle.finalCta },
  lab: {
    title: 'Cinematic Lab',
    liveGpu: 'LIVE GPU',
    storyChapters: '스토리 챕터',
    particleDensity: '파티클 밀도',
    interactiveOrbit: '인터랙티브 궤도',
    bgm: 'BGM',
    bgmHint: '씬별 앰비언트',
    sfx: '효과음',
    sfxHint: 'UI·데모·전환음',
    audioEngine: '오디오 엔진',
    audioHint: '자동 합성 사운드 웨이브',
  },
  admin: {
    title: '시네마틱 관리',
    backToFilm: '필름으로 돌아가기',
    save: '저장',
    backup: '백업',
    restore: '복원',
    exportJson: 'JSON 내보내기',
    importJson: 'JSON 가져오기',
    resetDefaults: '기본값으로',
    sceneEditor: '씬 편집',
    preview: '미리보기',
    saved: '설정이 저장되었습니다',
    backedUp: '백업이 생성되었습니다',
    backedUpDisk: '백업 저장됨 (다운로드 + backups/ 폴더)',
    restored: '백업이 복원되었습니다',
    imported: '설정을 가져왔습니다',
    resetDone: '기본값으로 복원되었습니다',
  },
  scenes: sceneCopyToMessages(localeBundle.scenes),
};
