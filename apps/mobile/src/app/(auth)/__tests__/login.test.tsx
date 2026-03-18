import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../login";
import { signInWithKakao, signInWithGoogle, AuthError } from "@/libs/auth";

// auth 모듈 전체를 mock — 실제 SDK 호출 없이 테스트
jest.mock("@/libs/auth", () => ({
  signInWithKakao: jest.fn(),
  signInWithGoogle: jest.fn(),
  AuthError: class AuthError extends Error {
    code: string;
    constructor(code: string, message?: string) {
      super(message ?? code);
      this.code = code;
    }
  },
}));

// useTheme mock
jest.mock("@/constants/useTheme", () => ({
  useTheme: () => ({
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    surfaceRaised: "#ffffff",
    border: "#eeeeee",
  }),
}));

const mockSignInWithKakao = signInWithKakao as jest.MockedFunction<typeof signInWithKakao>;
const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginScreen", () => {
  // -------------------------------------------------------
  // 1. 초기 렌더링 — 필수 UI 요소가 모두 보이는지
  // -------------------------------------------------------
  it("로고, 소셜 로그인 버튼, 하단 안내 문구가 렌더링된다", () => {
    render(<LoginScreen />);

    // 로고 텍스트
    expect(screen.getByText("마루")).toBeTruthy();
    expect(screen.getByText("하나의 앱에서, 모든 소통을")).toBeTruthy();

    // 소셜 로그인 버튼
    expect(screen.getByText("카카오로 시작하기")).toBeTruthy();
    expect(screen.getByText("Google로 시작하기")).toBeTruthy();

    // 하단 안내 문구 (줄바꿈 포함이라 부분 매칭)
    expect(screen.getByText(/서비스 이용약관/)).toBeTruthy();
  });

  // -------------------------------------------------------
  // 2. 카카오 로그인 버튼 → signInWithKakao 호출
  // -------------------------------------------------------
  it("카카오 버튼을 누르면 signInWithKakao가 호출된다", async () => {
    mockSignInWithKakao.mockResolvedValueOnce({} as any);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("카카오로 시작하기"));

    await waitFor(() => {
      expect(mockSignInWithKakao).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------
  // 3. 구글 로그인 버튼 → signInWithGoogle 호출
  // -------------------------------------------------------
  it("구글 버튼을 누르면 signInWithGoogle이 호출된다", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({} as any);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Google로 시작하기"));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------
  // 4. 로그인 실패 → 에러 모달 표시
  // -------------------------------------------------------
  it("로그인 실패 시 에러 모달이 표시된다", async () => {
    mockSignInWithKakao.mockRejectedValueOnce(
      new AuthError("AUTH_FAILED", "서버 오류"),
    );
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("카카오로 시작하기"));

    await waitFor(() => {
      expect(screen.getByText("로그인 실패")).toBeTruthy();
      expect(screen.getByText("로그인 중 문제가 발생했습니다. 다시 시도해주세요.")).toBeTruthy();
    });
  });

  // -------------------------------------------------------
  // 5. 사용자 취소 → 에러 모달이 표시되지 않음
  // -------------------------------------------------------
  it("사용자가 로그인을 취소하면 에러 모달이 표시되지 않는다", async () => {
    mockSignInWithKakao.mockRejectedValueOnce(
      new AuthError("AUTH_CANCELLED"),
    );
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("카카오로 시작하기"));

    // 취소 후 충분히 기다린 뒤에도 에러 모달이 없어야 함
    await waitFor(() => {
      expect(mockSignInWithKakao).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText("로그인 실패")).toBeNull();
  });

  // -------------------------------------------------------
  // 6. 에러 모달 닫기
  // -------------------------------------------------------
  it("에러 모달의 확인 버튼을 누르면 모달이 닫힌다", async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(
      new AuthError("AUTH_FAILED", "네트워크 오류"),
    );
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Google로 시작하기"));

    // 에러 모달이 표시될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("로그인 실패")).toBeTruthy();
    });

    // 확인 버튼 누르기
    fireEvent.press(screen.getByText("확인"));

    await waitFor(() => {
      expect(screen.queryByText("로그인 실패")).toBeNull();
    });
  });

  // -------------------------------------------------------
  // 7. 로딩 중에는 버튼이 비활성화
  // -------------------------------------------------------
  it("로그인 진행 중에는 버튼이 비활성화된다", async () => {
    // signInWithKakao가 resolve되지 않는 Promise를 반환 → 로딩 상태 유지
    let resolveLogin: (value?: any) => void;
    mockSignInWithKakao.mockImplementationOnce(
      () => new Promise<any>((resolve) => { resolveLogin = resolve; }),
    );
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("카카오로 시작하기"));

    // 로딩 중 텍스트 표시
    await waitFor(() => {
      expect(screen.getByText("로그인 중...")).toBeTruthy();
    });

    // resolve하여 로딩 종료
    resolveLogin!();
    await waitFor(() => {
      expect(screen.queryByText("로그인 중...")).toBeNull();
    });
  });
});
