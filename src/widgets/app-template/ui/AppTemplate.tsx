import { type FC, Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageLoader } from '@/shared/ui/page-loader';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

import styles from './styles.module.scss';

export const AppTemplate: FC = () => {
  return (
    <div className={styles.layout}>
      <Header className={styles.layoutHeader} />
      <main className={styles.layoutMain}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer className={styles.layoutFooter} />
    </div>
  );
};
