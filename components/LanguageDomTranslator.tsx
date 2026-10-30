'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguageStore } from '@/store/languageStore';
import { translateSpanishString } from '@/lib/i18n/autoTranslate';
import type { Language } from '@/lib/i18n/translations';

const originalTextMap = new WeakMap<Text, string>();
const lastRenderedTextMap = new WeakMap<Text, string>();
const originalAttrMap = new WeakMap<Element, Map<string, string>>();
const lastRenderedAttrMap = new WeakMap<Element, Map<string, string>>();

const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label'] as const;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH']);

function processTextNode(node: Text, lang: Language) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName)) return;
  if (parent.closest('[data-no-translate="true"]')) return;

  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  const lastRendered = lastRenderedAttrOrText(node);
  if (lastRendered === undefined || currentVal !== lastRendered) {
    // React or DOM updated the underlying source text
    originalTextMap.set(node, currentVal);
  }

  const sourceSpanish = originalTextMap.get(node) ?? currentVal;

  if (lang === 'es') {
    if (currentVal !== sourceSpanish) {
      node.nodeValue = sourceSpanish;
    }
    lastRenderedTextMap.set(node, sourceSpanish);
    return;
  }

  const translated = translateSpanishString(sourceSpanish, lang);
  if (translated && translated !== currentVal) {
    node.nodeValue = translated;
    lastRenderedTextMap.set(node, translated);
  } else if (!translated && currentVal !== sourceSpanish) {
    node.nodeValue = sourceSpanish;
    lastRenderedTextMap.set(node, sourceSpanish);
  } else {
    lastRenderedTextMap.set(node, currentVal);
  }
}

function lastRenderedAttrOrText(node: Text): string | undefined {
  return lastRenderedTextMap.get(node);
}

function processElementAttributes(el: Element, lang: Language) {
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.closest('[data-no-translate="true"]')) return;

  for (const attr of TRANSLATABLE_ATTRS) {
    const val = el.getAttribute(attr);
    if (!val || !val.trim()) continue;

    let origMap = originalAttrMap.get(el);
    if (!origMap) {
      origMap = new Map();
      originalAttrMap.set(el, origMap);
    }
    let renderedMap = lastRenderedAttrMap.get(el);
    if (!renderedMap) {
      renderedMap = new Map();
      lastRenderedAttrMap.set(el, renderedMap);
    }

    const lastRendered = renderedMap.get(attr);
    if (lastRendered === undefined || val !== lastRendered) {
      origMap.set(attr, val);
    }

    const sourceSpanish = origMap.get(attr) ?? val;

    if (lang === 'es') {
      if (val !== sourceSpanish) {
        el.setAttribute(attr, sourceSpanish);
      }
      renderedMap.set(attr, sourceSpanish);
      continue;
    }

    const translated = translateSpanishString(sourceSpanish, lang);
    if (translated && translated !== val) {
      el.setAttribute(attr, translated);
      renderedMap.set(attr, translated);
    } else {
      renderedMap.set(attr, val);
    }
  }
}

function translateSubtree(root: Node, lang: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root as Text, lang);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    processElementAttributes(root as Element, lang);
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );

  let current: Node | null = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      processTextNode(current as Text, lang);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      processElementAttributes(current as Element, lang);
    }
    current = walker.nextNode();
  }
}

export default function LanguageDomTranslator() {
  const language = useLanguageStore((state) => state.language);
  const initLanguage = useLanguageStore((state) => state.initLanguage);
  const pathname = usePathname();

  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return;

    let isMutating = false;

    const runPass = (target: Node = document.body) => {
      if (isMutating) return;
      isMutating = true;
      try {
        translateSubtree(target, language);
      } finally {
        isMutating = false;
      }
    };

    runPass(document.body);

    const observer = new MutationObserver((mutations) => {
      if (isMutating) return;
      isMutating = true;
      try {
        for (const m of mutations) {
          if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
            processTextNode(m.target as Text, language);
          } else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) {
            processElementAttributes(m.target as Element, language);
          } else if (m.type === 'childList') {
            m.addedNodes.forEach((node) => {
              translateSubtree(node, language);
            });
          }
        }
      } finally {
        isMutating = false;
      }
    });

    observer.observe(document.body, {
      Subtree: true,
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    } as MutationObserverInit);

    return () => observer.disconnect();
  }, [language, pathname]);

  return null;
}
