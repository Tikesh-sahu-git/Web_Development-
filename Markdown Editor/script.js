document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownPreview = document.getElementById('markdown-preview');
    const togglePreviewBtn = document.getElementById('toggle-preview');
    const downloadBtn = document.getElementById('download-md');
    const clearBtn = document.getElementById('clear');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const previewContainer = document.getElementById('preview-container');
    const toolbarButtons = document.querySelectorAll('.toolbar button[data-md]');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    
    // Initialize with some sample Markdown
    markdownInput.value = `# Welcome to Markdown Editor

## This is a subheading

You can write **bold** or _italic_ text.

### Features:
- Live preview
- Toolbar shortcuts
- Download your markdown
- Responsive design
- Light/dark mode

\`\`\`javascript
// Example code
function hello() {
    console.log("Hello, Markdown!");
}
\`\`\`

> This is a blockquote

[Markdown Guide](https://www.markdownguide.org)`;

    // Initial render
    updatePreview();
    
    // Update preview on input
    markdownInput.addEventListener('input', updatePreview);
    
    // Toggle preview visibility
    togglePreviewBtn.addEventListener('click', function() {
        previewContainer.style.display = previewContainer.style.display === 'none' ? 'flex' : 'none';
        togglePreviewBtn.innerHTML = previewContainer.style.display === 'none' 
            ? '<i class="fas fa-eye-slash"></i> Show Preview' 
            : '<i class="fas fa-eye"></i> Hide Preview';
    });
    
    // Download markdown file
    downloadBtn.addEventListener('click', function() {
        const content = markdownInput.value;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown-document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Clear editor
    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the editor?')) {
            markdownInput.value = '';
            updatePreview();
        }
    });
    
    // Toggle theme
    themeToggleBtn.addEventListener('click', function() {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Add toolbar button functionality
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mdSyntax = this.getAttribute('data-md');
            insertAtCursor(markdownInput, mdSyntax);
            updatePreview();
        });
    });
    
    // Function to update the preview
    function updatePreview() {
        const markdownText = markdownInput.value;
        markdownPreview.innerHTML = marked.parse(markdownText);
    }
    
    // Function to set theme
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            htmlElement.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }
    
    // Function to insert text at cursor position
    function insertAtCursor(textarea, text) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = textarea.value.substring(startPos, endPos);
        const beforeText = textarea.value.substring(0, startPos);
        const afterText = textarea.value.substring(endPos);
        
        // If text is selected, wrap it
        if (selectedText) {
            // For code blocks, put the selected text between the backticks
            if (text.startsWith('```')) {
                textarea.value = beforeText + '```\n' + selectedText + '\n```' + afterText;
                textarea.selectionStart = startPos + 4 + selectedText.length;
                textarea.selectionEnd = textarea.selectionStart;
            } else {
                textarea.value = beforeText + text.replace('selected', selectedText) + afterText;
                textarea.selectionStart = startPos + text.indexOf('selected');
                textarea.selectionEnd = textarea.selectionStart + selectedText.length;
            }
        } else {
            textarea.value = beforeText + text + afterText;
            // Position cursor appropriately
            if (text.includes('url')) {
                textarea.selectionStart = startPos + text.indexOf('url');
                textarea.selectionEnd = startPos + text.indexOf('url') + 3;
            } else if (text.includes('alt')) {
                textarea.selectionStart = startPos + text.indexOf('alt');
                textarea.selectionEnd = startPos + text.indexOf('alt') + 3;
            } else {
                textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
            }
        }
        
        textarea.focus();
    }
});