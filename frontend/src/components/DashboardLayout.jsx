import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export default function DashboardLayout({ children, title, subtitle }) {
    return (
        <div className="layout">
            <Sidebar />
            <motion.main
                className="main-content"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {(title || subtitle) && (
                    <div className="page-header">
                        {title && <h1>{title}</h1>}
                        {subtitle && <p className="subtitle">{subtitle}</p>}
                    </div>
                )}
                {children}
            </motion.main>
        </div>
    )
}
