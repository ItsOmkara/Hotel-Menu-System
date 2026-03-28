function showTab(tabId) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.content').forEach(section => section.classList.remove('active'));
  document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Updated sub-tab logic
function showVegSubTab(subTabId) {
  document.querySelectorAll('.veg-subtab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`button[data-subtab="${subTabId}"]`).classList.add('active');
  document.querySelectorAll('.veg-subcontent').forEach(section => section.classList.remove('active'));
  document.getElementById(subTabId).classList.add('active');
}

function showNonVegSubTab(subTabId) {
  document.querySelectorAll('.nonveg-subtab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`button[data-subtab="${subTabId}"]`).classList.add('active');
  document.querySelectorAll('.nonveg-subcontent').forEach(section => section.classList.remove('active'));
  document.getElementById(subTabId).classList.add('active');
}

function showDrinksSubTab(subTabId) {
  document.querySelectorAll('.drinks-subtab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`button[data-subtab="${subTabId}"]`).classList.add('active');
  document.querySelectorAll('.drinks-subcontent').forEach(section => section.classList.remove('active'));
  document.getElementById(subTabId).classList.add('active');
}
// Convert select to toggle-style
function replaceSelectWithToggles(containerSelector) {
  document.querySelectorAll(`${containerSelector} .card`).forEach(card => {
    const select = card.querySelector('.size-select');
    const priceElem = card.querySelector('.price');
    if (!select || !priceElem) return;

    const options = Array.from(select.options);
    const group = document.createElement('div');
    group.className = 'size-toggle-group';
    const name = `size-${Math.random().toString(36).substring(2, 8)}`;

    options.forEach((opt, idx) => {
      const id = `${name}-${idx}`;
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.className = 'size-toggle';
      input.value = opt.value;
      input.id = id;
      if (idx === 0) input.checked = true;

      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = opt.text;

      group.appendChild(input);
      group.appendChild(label);

      input.addEventListener('change', function () {
        if (this.checked) priceElem.textContent = `₹${this.value}`;
      });
    });

    select.parentNode.insertBefore(group, select);
    select.remove();

    const checked = group.querySelector('.size-toggle:checked');
    if (checked) priceElem.textContent = `₹${checked.value}`;
  });
}

// Apply to all sections
replaceSelectWithToggles('#drinks');
replaceSelectWithToggles('#veg-starters');
replaceSelectWithToggles('#veg-maincourse');
replaceSelectWithToggles('#nonveg-starters');
replaceSelectWithToggles('#nonveg-maincourse');
replaceSelectWithToggles('#drinks-whiskey');
replaceSelectWithToggles('#drinks-rum');
replaceSelectWithToggles('#drinks-beer');
replaceSelectWithToggles('#drinks-wine');
replaceSelectWithToggles('#drinks-vodka');

// 🔥 Add listeners for veg sub-tab buttons
// Universal search logic
document.getElementById('universal-search').addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? '' : 'none';
  });
});



// Universal search logic with tab switching and subtab reveal
document.getElementById('universal-search').addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  let foundInTab = null;
  let foundInSubtab = null;

  // Hide all cards initially
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
  });

  // Search all cards, show those that match, and track their tab/subtab
  document.querySelectorAll('.card').forEach(card => {
    const text = card.textContent.toLowerCase();
    if (query === '' || text.includes(query)) {
      card.style.display = '';
      // Find parent tab and subtab
      let parent = card.parentElement;
      while (parent && !parent.classList.contains('content')) {
        if (parent.classList.contains('veg-subcontent') || parent.classList.contains('nonveg-subcontent') || parent.classList.contains('drinks-subcontent')) {
          foundInSubtab = parent.id;
        }
        parent = parent.parentElement;
      }
      if (parent && parent.classList.contains('content')) {
        foundInTab = parent.id;
      }
    }
  });

  // If query is empty, reset to default tabs/subtabs
  if (query === '') {
    // Show default tab and subtab
    showTab('veg');
    showVegSubTab('veg-starters');
    showNonVegSubTab('nonveg-starters');
    showDrinksSubTab('drinks-whiskey');
    document.querySelectorAll('.card').forEach(card => card.style.display = '');
    return;
  }

  // Switch to the tab and subtab where the match was found
  if (foundInTab) {
    showTab(foundInTab);
    if (foundInTab === 'veg' && foundInSubtab) showVegSubTab(foundInSubtab);
    if (foundInTab === 'nonveg' && foundInSubtab) showNonVegSubTab(foundInSubtab);
    if (foundInTab === 'drinks' && foundInSubtab) showDrinksSubTab(foundInSubtab);
  }
});

const mainTabs = document.querySelector('.tabs');
  if (mainTabs) {
    const riceTabBtn = document.createElement('button');
    riceTabBtn.className = 'tab-button';
    riceTabBtn.innerText = 'Rice/Roti';
    riceTabBtn.onclick = function() {
      showTab('rice-roti');
    };
    // Insert after Main Course (nonveg) tab, before Drinks
    mainTabs.insertBefore(riceTabBtn, mainTabs.children[2]);
  }

  // Show/hide Rice/Roti tab content
  function showTab(tabId) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    // Highlight correct main tab
    let idx = ['veg','nonveg','rice-roti','drinks'].indexOf(tabId);
    if (idx !== -1) {
      document.querySelectorAll('.tabs .tab-button')[idx].classList.add('active');
    }
  }

  // Rice/Roti subtabs
  function showRiceSubTab(subtabId) {
    document.querySelectorAll('.rice-subcontent').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.rice-subcontent').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.rice-subtab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(subtabId).classList.add('active');
    document.getElementById(subtabId).style.display = '';
    document.querySelector('.rice-subtab-button[data-subtab="' + subtabId + '"]').classList.add('active');
  }

