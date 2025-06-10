// 개발 서버 리로드 시에 새로운 인스턴스를 생성하지 않고 기존 인스턴스를 재사용하기 위한 싱글톤 패턴 구현
// Borrowed/modified from https://github.com/jenseng/abuse-the-platform/blob/2993a7e846c95ace693ce61626fa072174c8d9c7/app/utils/singleton.ts

export const singleton = <Value>(
  name: string,
  valueFactory: () => Value,
): Value => {
  const g = global as unknown as { __singletons: Record<string, unknown> };
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name] as Value;
};
