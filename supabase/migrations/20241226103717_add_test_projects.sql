-- Insert test projects for MagLoft
INSERT INTO public.projects (
    company_id,
    title,
    description,
    goal,
    amount_pledged,
    end_date,
    header_image_url,
    status,
    created_at
) VALUES
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Advanced Analytics Dashboard with Reader Behavior Tracking',
    'Implement a comprehensive analytics dashboard that tracks detailed reader behavior including time spent per page, interaction with interactive elements, and reading patterns. The system will use client-side JavaScript to collect metrics and store them in a time-series database for efficient querying.\n\nTechnical Implementation:\n- Client-side tracking using React and Intersection Observer API\n- Time-series data storage in TimescaleDB\n- Real-time data processing with Apache Kafka\n- Interactive visualizations using D3.js\n\nThis feature will help publishers understand their readers better and optimize content based on actual usage data.',
    8500,
    6375,
    (CURRENT_TIMESTAMP + INTERVAL '25 days')::timestamp,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Apple News Integration for Content Distribution',
    'Develop a seamless integration with Apple News to automatically distribute digital magazine content. This integration will allow publishers to reach Apple''s vast reader base while maintaining their content''s formatting and style.\n\nTechnical Specifications:\n- Apple News Format (ANF) conversion engine\n- Metadata mapping system\n- Automated article submission via Apple News API\n- Analytics integration for cross-platform tracking\n\nPublishers will be able to manage their Apple News presence directly from the MagLoft dashboard.',
    6000,
    2400,
    (CURRENT_TIMESTAMP + INTERVAL '18 days')::timestamp,
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Custom CSS Editor with Live Preview',
    'Add a powerful CSS editor with syntax highlighting and live preview capabilities. Publishers can customize their digital magazine''s appearance with real-time visual feedback.\n\nTechnical Features:\n- Monaco Editor integration (same engine as VS Code)\n- WebSocket-based live preview\n- CSS preprocessor support (SASS/LESS)\n- Custom theme templates system\n\nThis will give publishers more control over their brand identity and design consistency.',
    3500,
    3150,
    (CURRENT_TIMESTAMP + INTERVAL '12 days')::timestamp,
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Automated PDF to HTML5 Conversion Engine',
    'Create an advanced PDF to HTML5 conversion system that maintains complex layouts while ensuring mobile responsiveness. The system will use AI to detect content structure and optimize for different screen sizes.\n\nTechnical Implementation:\n- PDF.js for initial parsing\n- Machine learning for layout analysis\n- Custom HTML5 grid system\n- Responsive image optimization\n\nThis will significantly reduce the time needed to convert traditional magazines to digital format.',
    9500,
    2850,
    (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamp,
    'https://images.unsplash.com/photo-1568027762272-e4da8b386fe9?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Multi-language Support with Neural Translation',
    'Implement comprehensive multi-language support using neural machine translation. Publishers can automatically translate their content while maintaining formatting and layout.\n\nTechnical Details:\n- Integration with OpenAI''s GPT-4 for translation\n- Language-specific typography handling\n- RTL language support\n- Translation memory system\n\nThis feature will help publishers reach international audiences with minimal additional effort.',
    7500,
    1875,
    (CURRENT_TIMESTAMP + INTERVAL '21 days')::timestamp,
    'https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Interactive Content Creation Tools',
    'Develop a suite of tools for creating interactive content including quizzes, surveys, and animated infographics. All interactions will be tracked in the analytics system.\n\nTechnical Features:\n- React-based widget system\n- Custom animation engine\n- Data collection API\n- Export/import functionality\n\nPublishers can create engaging content that encourages reader interaction and provides valuable feedback.',
    4500,
    3600,
    (CURRENT_TIMESTAMP + INTERVAL '15 days')::timestamp,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Offline Reading Mode with Progressive Web App',
    'Create a Progressive Web App (PWA) version of the reader that enables offline access to downloaded magazines. Includes smart caching and background sync.\n\nTechnical Implementation:\n- Service Worker implementation\n- IndexedDB for content storage\n- Background sync for analytics\n- Push notification system\n\nReaders can access their magazines anywhere, even without an internet connection.',
    5500,
    4125,
    (CURRENT_TIMESTAMP + INTERVAL '28 days')::timestamp,
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Advanced Search with Natural Language Processing',
    'Implement an advanced search system using NLP to understand context and meaning, not just keywords. Includes OCR for searching within PDFs and images.\n\nTechnical Stack:\n- Elasticsearch with custom analyzers\n- Tesseract OCR integration\n- BERT-based semantic search\n- Redis cache layer\n\nMakes finding specific content within large publications quick and intuitive.',
    6500,
    975,
    (CURRENT_TIMESTAMP + INTERVAL '20 days')::timestamp,
    'https://images.unsplash.com/photo-1557853197-aefb550b6fdc?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Social Media Integration Hub',
    'Create a centralized hub for managing social media sharing and promotion. Includes scheduling, analytics, and automatic format adaptation for different platforms.\n\nTechnical Features:\n- OAuth integration with major platforms\n- Image/video transcoding pipeline\n- Scheduled posting system\n- Cross-platform analytics\n\nStreamlines social media promotion and tracking for publishers.',
    3000,
    2250,
    (CURRENT_TIMESTAMP + INTERVAL '10 days')::timestamp,
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
),
(
    '423ab041-c721-4c96-84a9-150315be8966',
    'Automated Email Newsletter System',
    'Build an advanced email newsletter system that automatically creates and sends newsletters based on magazine content. Includes A/B testing and engagement tracking.\n\nTechnical Implementation:\n- Template engine with MJML\n- Integration with major ESP APIs\n- A/B testing framework\n- Engagement analytics system\n\nHelps publishers maintain reader engagement between issues and track effectiveness.',
    4000,
    3200,
    (CURRENT_TIMESTAMP + INTERVAL '14 days')::timestamp,
    'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=1200&h=630',
    'published',
    CURRENT_TIMESTAMP
);
