<script>
  import { onMount } from 'svelte';
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import { PDFDocument, degrees } from 'pdf-lib';
  import { API_URL, updateTrigger } from '../stores';
  import { get, postFormData } from '$lib';
	import { getToastStore } from '@skeletonlabs/skeleton';
  import { CloudUpload, Download } from 'lucide-svelte';

  const toastStore = getToastStore();

  let file = null;
  let pages = 'all';
  let customPages = '';
  let copies = 1;
  let orientation = 'portrait';
  let pdfInfo = null;

  let totalPages = 0;
  let bill = 0;
  let isValid = false;
  let costPerPage = 0;
  let processedPdfUrl = null;

  async function onFileSelect(e) {
    const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        file = selectedFile;
        pdfInfo = await getPDFInfo(file);
      } else {
        alert('Please upload a PDF file.');
        file = null;
        pdfInfo = null;
      }
    } else {
      file = null;
      pdfInfo = null;
    }
  }

  async function getPDFInfo(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return {
      name: file.name,
      size: formatFileSize(file.size),
      pages: pdfDoc.getPageCount()
    };
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async function fetchCostPerPage() {
    const response = await get(`${$API_URL}/api/cost`);
    if (response.status === 200) {
      costPerPage = response.result.cost;
    } else {
      console.error('Error fetching print cost:', response);
    }
  }

  function updateBill() {
    if (!pdfInfo) return;

    let pageList = [];
    if (pages === 'all') {
      pageList = Array.from({ length: pdfInfo.pages }, (_, i) => i + 1);
    } else if (pages === 'even') {
      pageList = Array.from({ length: Math.floor(pdfInfo.pages / 2) }, (_, i) => (i + 1) * 2);
    } else if (pages === 'odd') {
      pageList = Array.from({ length: Math.ceil(pdfInfo.pages / 2) }, (_, i) => i * 2 + 1);
    } else if (pages === 'custom') {
      pageList = parseCustomPages(customPages, pdfInfo.pages);
    }

    totalPages = pageList.length * copies;
    bill = totalPages * costPerPage;
    isValid = totalPages > 0 && costPerPage > 0;
  }

  function parseCustomPages(input, maxPages) {
    const pageList = [];
    const ranges = input.split(',').map(range => range.trim());
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(num => parseInt(num));
        for (let i = start; i <= end && i <= maxPages; i++) {
          pageList.push(i);
        }
      } else {
        const page = parseInt(range);
        if (page <= maxPages) {
          pageList.push(page);
        }
      }
    }

    return [...new Set(pageList)].sort((a, b) => a - b);
  }

  $: {
    if (pdfInfo) {
      updateBill();
    } else {
      isValid = false;
    }
  }

  $: if (copies || pages || customPages) {
    updateBill();
  }

  async function fetchUserBalance() {
    const profileResponse = await get(`${$API_URL}/user/profile`);
    if (profileResponse.status === 200) {
      return profileResponse.result.currentBalance;
    } else {
      console.error('Error fetching user balance:', profileResponse);
      return 0;
    }
  }

  async function processFile() {
    if (!file || !isValid) return null;

    // Check user balance before processing
    const userBalance = await fetchUserBalance();
    if (bill > userBalance) {
      toastStore.trigger({
        message: 'Insufficient balance to complete the operation.',
        background: 'variant-filled-error'
      });
      return null;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Process pages
      let pageIndexes = [];
      if (pages === 'all') {
        pageIndexes = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
      } else if (pages === 'even') {
        pageIndexes = Array.from({ length: Math.floor(pdfDoc.getPageCount() / 2) }, (_, i) => i * 2 + 1);
      } else if (pages === 'odd') {
        pageIndexes = Array.from({ length: Math.ceil(pdfDoc.getPageCount() / 2) }, (_, i) => i * 2);
      } else if (pages === 'custom') {
        pageIndexes = parseCustomPages(customPages, pdfDoc.getPageCount()).map(p => p - 1);
      }

      // Create a new PDF with selected pages
      const newPdfDoc = await PDFDocument.create();
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndexes);

      // Add pages to the new document, applying rotation if necessary
      copiedPages.forEach(page => {
        if (orientation === 'landscape') {
          page.setRotation(degrees(90));
        }
        newPdfDoc.addPage(page);
      });

      // Create copies
      const finalPdfDoc = await PDFDocument.create();
      for (let i = 0; i < copies; i++) {
        const copiedPages = await finalPdfDoc.copyPages(newPdfDoc, newPdfDoc.getPageIndices());
        copiedPages.forEach(page => finalPdfDoc.addPage(page));
      }

      // Serialize the PDF to bytes
      const pdfBytes = await finalPdfDoc.save();

      // Create a Blob and URL for the processed PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF: ' + error.message);
      return null;
    }
  }

  async function handleDownload() {
    const url = await processFile();
    if (url) {
      processedPdfUrl = url;
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function handleUpload() {
    const url = processedPdfUrl || await processFile();
    if (!url) return;

    try {
      // Proceed with the upload
      const response = await fetch(url);
      const blob = await response.blob();
      const processedFile = new File([blob], file.name, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', processedFile);

      const apiResponse = await postFormData(`${$API_URL}/api/upload`, formData);

      if (apiResponse.status === 200) {
        toastStore.trigger({
          message: 'File uploaded successfully!',
          background: 'variant-filled-success'
        });
        // Reset form or navigate to a success page
      } else {
        throw new Error(apiResponse.result.message || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error:', error);
      toastStore.trigger({
        message: `Error: ${error.message}`,
        background: 'variant-filled-error'
      });
    }
  }

  onMount(async () => {
    await fetchCostPerPage();
  });

  $: {
    $updateTrigger;
    fetchCostPerPage();
  }
</script>

<div class="card p-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg rounded-[20px] shadow-slate-900">
  <h2 class="h2 mb-4">Upload File</h2>

  <div class="mb-4">
    <FileDropzone name="files" on:change={onFileSelect} multiple={false} accept=".pdf" class="h-[120px]">
      <svelte:fragment slot="lead">
        <div class="flex justify-center items-center">
          <CloudUpload size={24} />
        </div>        
      </svelte:fragment>
      <svelte:fragment slot="message">
        {pdfInfo ? pdfInfo.name : 'Upload your PDF file'}
      </svelte:fragment>
      <svelte:fragment slot="meta">
        {pdfInfo ? `${pdfInfo.size} | ${pdfInfo.pages} pages` : 'Accepts PDF files up to 50MB'}
      </svelte:fragment>
    </FileDropzone>
  </div>
  <div class="card variant-glass-surface p-4 rounded-[20px]">
    <div class="grid grid-cols-2 gap-4">
      <label class="label">
        <span>Pages</span>
        <select class="select rounded-md" bind:value={pages}>
          <option value="all">All Pages</option>
          <option value="even">Even Pages</option>
          <option value="odd">Odd Pages</option>
          <option value="custom">Custom Pages</option>
        </select>
      </label>
      {#if pages === 'custom'}
        <label class="label">
          <span>Custom Pages</span>
          <input type="text" class="input rounded-md" bind:value={customPages} placeholder="e.g. 1-3, 5, 7-9">
        </label>
      {/if}
      <label class="label">
        <span>Copies</span>
        <input type="number" class="input rounded-md" bind:value={copies} min="1" max="50">
      </label>
      <label class="label">
        <span>Orientation</span>
        <select class="select rounded-md" bind:value={orientation}>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>
    </div>
  </div>

  <!-- Updated container for pages and bill information -->
  <div class="card variant-glass-surface p-4 rounded-[20px] mt-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h3 class="h4 mb-2">Total Pages</h3>
        <p>{totalPages}</p>
      </div>
      <div>
        <h3 class="h4 mb-2">Cost</h3>
        <p>{bill}</p>
      </div>
    </div>
  </div>

  <div class="mt-4 flex gap-2">
    <button class="btn variant-filled-primary flex-1" disabled={!isValid} on:click={handleUpload}>
      Upload
    </button>
    <button class="btn variant-filled-secondary" disabled={!isValid} on:click={handleDownload}>
      <Download size={16} />
    </button>
  </div>
</div>
