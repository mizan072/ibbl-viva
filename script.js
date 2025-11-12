document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    let allQaData = []; // To store the fetched data
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentFilteredData = []; // Data currently being shown (after filter)

    // --- Element References ---
    const searchInput = document.getElementById('searchInput');
    const qaContainer = document.getElementById('qa-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    // --- Navigation Elements ---
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navAboutBtn = document.getElementById('nav-about-btn');
    const homeView = document.getElementById('home-view');
    const aboutView = document.getElementById('about-view');

    // --- PDF Elements ---
    const pdfButton = document.getElementById('generate-pdf-btn');
    const loadingOverlay = document.getElementById('loading-overlay');

    /**
     * Renders the Q&A items for the *current* page.
     */
    function renderPage() {
        qaContainer.innerHTML = ''; // Clear previous items

        // Calculate items for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = currentFilteredData.slice(startIndex, endIndex);

        // Show a message if no results
        if (currentFilteredData.length === 0) {
            qaContainer.innerHTML = `<p class="text-gray-500 text-center py-4">কোনো মিল খুঁজে পাওয়া যায়নি।</p>`;
            return;
        }

        // Create and append an HTML element for each Q&A item
        pageItems.forEach(item => {
            // Handle null or empty answers by providing a default message
            const answerText = item.answer || "নিজে দিবেন";

            const itemEl = document.createElement('div');
            itemEl.className = 'qa-item bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md';
            
            const answerId = `answer-${item.id}`;
            const questionId = `question-${item.id}`;

            itemEl.innerHTML = `
                <button
                    class="qa-question w-full flex justify-between items-center text-left p-4 font-semibold text-gray-700 hover:bg-gray-50 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-300"
                    aria-expanded="false"
                    aria-controls="${answerId}"
                    id="${questionId}"
                >
                    <!-- Relevant Icon (Lightbulb) -->
                    <svg class="w-5 h-5 text-teal-600 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.707.707A6.973 6.973 0 0012 18a6.973 6.973 0 00-3.182-1.05l-.707-.707z"></path></svg>
                    <span class="flex-1 text-base md:text-lg">${item.question}</span>
                    <!-- Chevron icon for accordion toggle -->
                    <svg class="chevron-icon w-5 h-5 text-gray-500 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div
                    id="${answerId}"
                    class="qa-answer p-4 text-gray-600 border-t border-gray-200 hidden bg-gray-50 rounded-b-lg"
                    aria-labelledby="${questionId}"
                    role="region"
                >
                    <p class="text-base">${answerText}</p>
                </div>
            `;
            qaContainer.appendChild(itemEl);
        });
    }

    /**
     * Renders the pagination controls.
     */
    function renderPagination() {
        paginationContainer.innerHTML = ''; // Clear old controls
        const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);

        if (totalPages <= 1) return; // No pagination needed

        // --- Previous Button ---
        const prevButton = document.createElement('button');
        prevButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`;
        prevButton.className = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
        prevButton.setAttribute('aria-label', 'Previous Page');
        if (currentPage === 1) {
            prevButton.disabled = true;
        }
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
                renderPagination();
                qaContainer.scrollTop = 0; // Scroll to top of list
            }
        });
        paginationContainer.appendChild(prevButton);

        // --- Page Number Buttons (Desktop) ---
        const pageButtonsWrapper = document.createElement('div');
        pageButtonsWrapper.className = 'hidden sm:flex items-center space-x-1';
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.className = 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium';
            if (i === currentPage) {
                pageButton.className += ' bg-teal-600 text-white border-teal-600';
            } else {
                pageButton.className += ' bg-white text-gray-600 hover:bg-gray-100';
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderPage();
                renderPagination();
                qaContainer.scrollTop = 0; // Scroll to top of list
            });
            pageButtonsWrapper.appendChild(pageButton);
        }
        paginationContainer.appendChild(pageButtonsWrapper);

        // --- Page Indicator (Mobile) ---
        const pageIndicator = document.createElement('span');
        pageIndicator.className = 'sm:hidden px-4 py-2 text-gray-700 font-medium text-sm';
        pageIndicator.innerText = `Page ${currentPage} of ${totalPages}`;
        paginationContainer.appendChild(pageIndicator);

        // --- Next Button ---
        const nextButton = document.createElement('button');
        nextButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        nextButton.className = 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
        nextButton.setAttribute('aria-label', 'Next Page');
        if (currentPage === totalPages) {
            nextButton.disabled = true;
        }
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage();
                renderPagination();
                qaContainer.scrollTop = 0; // Scroll to top of list
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    /**
     * Filters the main data list and triggers re-render.
     * @param {string} filter - The search text.
     */
    function filterData(filter = '') {
        const lowerCaseFilter = filter.toLowerCase();
        
        // Filter from the master 'allQaData' list
        currentFilteredData = allQaData.filter(item =>
            item.question.toLowerCase().includes(lowerCaseFilter) ||
            (item.answer && item.answer.toLowerCase().includes(lowerCaseFilter))
        );
        
        currentPage = 1; // Reset to page 1
        renderPage();
        renderPagination();
    }

    // --- Navigation Logic ---
    
    function showHome() {
        homeView.classList.remove('hidden');
        aboutView.classList.add('hidden');
        navHomeBtn.classList.add('bg-white/30');
        navAboutBtn.classList.remove('bg-white/20');
    }

    function showAbout() {
        homeView.classList.add('hidden');
        aboutView.classList.remove('hidden');
        navHomeBtn.classList.remove('bg-white/30');
        navAboutBtn.classList.add('bg-white/20');
    }

    /**
     * Generates a PDF of the currently filtered data.
     */
    async function generatePdf() {
        // 1. Show loading overlay
        loadingOverlay.classList.remove('hidden');

        // 2. Create a hidden element to render all items for the PDF
        const pdfContent = document.createElement('div');
        pdfContent.id = "pdf-content";
        pdfContent.style.position = "absolute";
        pdfContent.style.left = "-9999px";
        pdfContent.style.top = "0";
        document.body.appendChild(pdfContent);

        try {
            // 3. Build the HTML for the PDF
            const logoSvg = `<svg class="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="#0d9488" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M5 6l7-4 7 4M10 10v11M14 10v11M5 21V10"></path>
            </svg>`;
            
            let pdfHtml = `
                <div class="pdf-header">
                    ${logoSvg}
                    <div>
                        <h1 style="font-size: 24pt; font-weight: 700; color: #0d9488;">IBBL Viva Preparation</h1>
                        <p style="font-size: 12pt; color: #374151;">Islami Bank Bangladesh Ltd.</p>
                        <p style="font-size: 10pt; color: #6b7280;">40 Dilkusha C/A, Dhaka-1000, Bangladesh</p>
                    </div>
                </div>
                <h2>All Questions & Answers</h2>
                <p style="font-size: 10pt; color: #6b7280; margin-bottom: 20px;">Total items: ${currentFilteredData.length}</p>
            `;

            // Loop through *all* filtered data
            currentFilteredData.forEach(item => {
                const answerText = item.answer || "নিজে দিবেন";
                pdfHtml += `
                    <div class="pdf-qa-item">
                        <div class="pdf-question">${item.id}. ${item.question}</div>
                        <div class="pdf-answer">${answerText}</div>
                    </div>
                `;
            });

            pdfContent.innerHTML = pdfHtml;

            // 4. Use html2canvas to capture the *entire* hidden div
            const canvas = await html2canvas(pdfContent, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false
            });

            // 5. Use jsPDF to create the multi-page PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // 6. Save the PDF
            pdf.save('IBBL_Viva_Prep.pdf');

        } catch (error) {
            console.error("Error generating PDF:", error);
            qaContainer.innerHTML = `<p class="text-red-600 text-center py-4">Error generating PDF. Please try again.</p>`;
        } finally {
            // 7. Clean up
            loadingOverlay.classList.add('hidden');
            document.body.removeChild(pdfContent);
        }
    }

    /**
     * Main function to fetch data and initialize the app.
     */
    async function initializeApp() {
        try {
            // Fetch the external JSON file
            const response = await fetch('ibbl-viva-pre.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allQaData = await response.json(); // Store data
            currentFilteredData = allQaData; // Set initial filter state
            
            filterData(''); // Trigger the first render
        } catch (error) {
            console.error('Error fetching Q&A data:', error);
            qaContainer.innerHTML = '<p class="text-red-600 text-center py-4">Error loading questions. Please check the JSON file and reload.</p>';
        }
    }

    // --- Attach Event Listeners ---

    // 1. Search input
    searchInput.addEventListener('input', (e) => {
        filterData(e.target.value);
    });

    // 2. Accordion click (using event delegation)
    qaContainer.addEventListener('click', (e) => {
        const questionButton = e.target.closest('.qa-question');
        if (questionButton) {
            const answer = questionButton.nextElementSibling;
            const chevron = questionButton.querySelector('.chevron-icon');
            const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                answer.classList.add('hidden');
                questionButton.setAttribute('aria-expanded', 'false');
                chevron.classList.remove('rotate-180');
            } else {
                answer.classList.remove('hidden');
                questionButton.setAttribute('aria-expanded', 'true');
                chevron.classList.add('rotate-180');
            }
        }
    });

    // 3. Navigation
    navHomeBtn.addEventListener('click', showHome);
    navAboutBtn.addEventListener('click', showAbout);

    // 4. PDF Generation
    pdfButton.addEventListener('click', generatePdf);

    // --- Initialize ---
    initializeApp(); // Start the app by fetching data
    showHome(); // Show home page by default
    aboutView.classList.add('hidden'); // Ensure about page is hidden

}); // End of DOMContentLoaded