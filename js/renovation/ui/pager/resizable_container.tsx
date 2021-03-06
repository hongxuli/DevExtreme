/* eslint-disable max-classes-per-file */
import {
  Component, ComponentBindings, JSXComponent,
  Effect, Template, InternalState, OneWay, ForwardRef, Ref, JSXTemplate, RefObject,
} from 'devextreme-generator/component_declaration/common';

import resizeCallbacks from '../../../core/utils/resize_callbacks';
import PagerProps from './common/pager_props';
import { getElementWidth, getElementStyle } from './utils/get_element_width';
import { DisposeEffectReturn } from '../../utils/effect_return.d';
import { PagerContentProps } from './content';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const viewFunction = ({
  parentRef,
  pageSizesRef,
  infoTextRef,
  pagesRef,
  infoTextVisible,
  isLargeDisplayMode,
  props: { contentTemplate: Content, pagerProps },
  restAttributes,
}: ResizableContainer) => (
  <Content
    rootElementRef={parentRef}
    pageSizesRef={pageSizesRef}
    infoTextRef={infoTextRef}
    pagesRef={pagesRef}
    infoTextVisible={infoTextVisible}
    isLargeDisplayMode={isLargeDisplayMode}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...{ ...pagerProps, ...restAttributes }}
  />
);
type ChildElementsName = 'pageSizes' | 'pages' | 'info';
type AllElementsName = 'parent' | ChildElementsName;
type AllElementsWidth = Record<AllElementsName, number>;
type ChildElementsWidth = Record<ChildElementsName, number>;
type HTMLRefType = Record<AllElementsName, HTMLElement | undefined>;
interface ChildElementProps {
  infoTextVisible: boolean;
  isLargeDisplayMode: boolean;
}

export function calculateAdaptivityProps({
  parent: parentWidth, pageSizes: pageSizesWidth,
  pages: pagesWidth, info: infoWidth,
}: AllElementsWidth): ChildElementProps {
  const minimalWidth = pageSizesWidth + pagesWidth + infoWidth;
  const infoTextVisible = parentWidth - minimalWidth > 0;
  const isLargeDisplayMode = parentWidth - (pageSizesWidth + pagesWidth) > 0;
  return {
    infoTextVisible,
    isLargeDisplayMode,
  };
}

function getElementsWidth({
  parent, pageSizes, pages, info,
}: HTMLRefType): AllElementsWidth {
  const parentWidth = getElementWidth(parent);
  const pageSizesWidth = getElementWidth(pageSizes);
  const infoWidth = getElementWidth(info);
  const pagesHtmlWidth = getElementWidth(pages);
  return {
    parent: parentWidth,
    pageSizes: pageSizesWidth,
    info: infoWidth + getElementStyle('marginLeft', info) + getElementStyle('marginRight', info),
    pages: pagesHtmlWidth - infoWidth,
  };
}

@ComponentBindings()
export class ResizableContainerProps {
  @OneWay() pagerProps!: PagerProps;

  @Template() contentTemplate!: JSXTemplate<PagerContentProps>;
}
@Component({
  defaultOptionRules: null,
  view: viewFunction,
})
export class ResizableContainer extends JSXComponent<ResizableContainerProps, 'pagerProps' | 'contentTemplate'>() {
  @ForwardRef() parentRef!: RefObject<HTMLDivElement>;

  @ForwardRef() pageSizesRef?: RefObject<HTMLDivElement>;

  @ForwardRef() infoTextRef?: RefObject<HTMLDivElement>;

  @ForwardRef() pagesRef?: RefObject<HTMLElement>;

  @InternalState() infoTextVisible = true;

  @InternalState() isLargeDisplayMode = true;

  @Ref() elementsWidth!: ChildElementsWidth;

  @Effect() subscribeToResize(): DisposeEffectReturn {
    const callback = (): void => this.updateChildrenProps();
    resizeCallbacks.add(callback);
    return (): void => { resizeCallbacks.remove(callback); };
  }

  @Effect({ run: 'always' }) effectUpdateChildProps(): void {
    const parentWidth = getElementWidth(this.parentRef);
    if (parentWidth > 0) {
      this.updateChildrenProps();
    }
  }

  updateElementsWidth({ info, pageSizes, pages }: ChildElementsWidth): void {
    this.elementsWidth = { info, pageSizes, pages };
  }

  // Vitik generator problem if use same name for updateChildProps and updateChildrenProps
  updateChildrenProps(): void {
    const currentElementsWidth = getElementsWidth({
      parent: this.parentRef,
      pageSizes: this.pageSizesRef,
      info: this.infoTextRef,
      pages: this.pagesRef,
    });
    const isEmpty = this.elementsWidth === undefined;
    if (isEmpty) {
      const current = calculateAdaptivityProps(currentElementsWidth);
      this.updateElementsWidth(currentElementsWidth);
      this.infoTextVisible = current.infoTextVisible;
      this.isLargeDisplayMode = current.isLargeDisplayMode;
    } else {
      if (this.isLargeDisplayMode) {
        this.elementsWidth.pageSizes = currentElementsWidth.pageSizes;
        this.elementsWidth.pages = currentElementsWidth.pages;
      }
      if (this.infoTextVisible) {
        this.elementsWidth.info = currentElementsWidth.info;
      }
      const current = calculateAdaptivityProps({
        parent: currentElementsWidth.parent,
        ...this.elementsWidth,
      });
      this.infoTextVisible = current.infoTextVisible;
      this.isLargeDisplayMode = current.isLargeDisplayMode;
    }
    /* const current = calculateAdaptivityProps(currentElementsWidth);
    const isNotFittedWithCurrentWidths = (!current.infoTextVisible && this.infoTextVisible)
    || (!current.isLargeDisplayMode && this.isLargeDisplayMode);
    const isEmpty = this.elementsWidth === undefined;
    if (isEmpty || isNotFittedWithCurrentWidths) {
      this.updateElementsWidth(currentElementsWidth);
      this.infoTextVisible = current.infoTextVisible;
      this.isLargeDisplayMode = current.isLargeDisplayMode;
    } else {
      const cached = calculateAdaptivityProps({
        parent: currentElementsWidth.parent,
        ...this.elementsWidth,
      });
      if (cached.isLargeDisplayMode) {
        this.elementsWidth.pageSizes = currentElementsWidth.pageSizes;
        this.elementsWidth.pages = currentElementsWidth.pages;
      }
      if (cached.infoTextVisible) {
        this.elementsWidth.info = currentElementsWidth.info;
      }
      this.infoTextVisible = cached.infoTextVisible;
      this.isLargeDisplayMode = cached.isLargeDisplayMode;
    } */
  }
}
