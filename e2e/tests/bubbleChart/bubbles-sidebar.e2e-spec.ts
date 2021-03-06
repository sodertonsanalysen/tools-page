import { browser, ExpectedConditions as EC } from 'protractor';
import { _$ } from '../../helpers/ExtendedElementFinder';

import { Sidebar, Slider } from '../../pageObjects/components';
import { BubbleChart, CommonChartPage } from '../../pageObjects/charts';
import { safeDragAndDrop, waitForSpinner } from '../../helpers/helper';

const commonChartPage: CommonChartPage = new CommonChartPage();
const bubbleChart: BubbleChart = new BubbleChart();
const slider: Slider = new Slider();

describe('Bubbles chart: Sidebar', () => {
  const sidebar: Sidebar = new Sidebar();

  beforeEach(async () => {
    await bubbleChart.openChart();
  });

  it('Select country using search', async () => {
    const country = 'China';
    await sidebar.findSelect.searchAndSelectCountry(country);

    expect(await bubbleChart.selectedCountries.count()).toEqual(1);
    expect(await browser.getCurrentUrl()).toContain(CommonChartPage.countries[country]);
  });

  it('deselect country using search field', async () => {
    // should check that countries could be selected/deselected using the button "Find" to the right(TC11)
    await sidebar.findSelect.searchAndSelectCountry('China');
    expect(await bubbleChart.selectedCountries.count()).toEqual(1);

    await sidebar.findSelect.searchAndSelectCountry('India');
    expect(await bubbleChart.selectedCountries.count()).toEqual(2);

    expect(await bubbleChart.selectedCountries.getText()).toMatch('China 2018');
    expect(await bubbleChart.selectedCountries.getText()).toMatch('India 2018');
    expect(await browser.getCurrentUrl()).toContain('geo=ind');
    expect(await browser.getCurrentUrl()).toContain('geo=chn');

    await sidebar.findSelect.deselectCountryInSearch('India');
    expect(await bubbleChart.selectedCountries.count()).toEqual(1);

    await sidebar.findSelect.deselectCountryInSearch('China');
    expect(await bubbleChart.selectedCountries.count()).toEqual(0);

    expect(await browser.getCurrentUrl()).not.toContain('geo=ind');
    expect(await browser.getCurrentUrl()).not.toContain('geo=chn');
  });

  it('x, y, trails and zoom remains after page refresh', async () => {
    /**
     * should check that x, y, trails and zoom  remains after page refresh(TC79)
     */
    // When X is time and showing a trail, zoom a rectangle on the part of the picture. Note min-max for x and y.
    // Refresh. Min-max for x and y should be the same. Trail should be preserved too
    await sidebar.findSelect.searchAndSelectCountry('China');

    await slider.dragToStart();
    await slider.dragToMiddle();

    await sidebar.zoomButton.safeClick();
    await safeDragAndDrop(bubbleChart.selectedCountryLabel, { x: 250, y: 250 });

    const axisYMaxValue = commonChartPage.axisYMaxValue.safeGetAttribute('TextContent');
    const axisXMaxValue = commonChartPage.axisXMaxValue.safeGetAttribute('TextContent');
    const trailsCount = bubbleChart.chinaTrails.count();

    await bubbleChart.refreshPage();

    const axisYNewMaxValue = commonChartPage.axisYMaxValue.safeGetAttribute('TextContent');
    const axisXNewMaxValue = commonChartPage.axisXMaxValue.safeGetAttribute('TextContent');
    const trailsCountNew = bubbleChart.chinaTrails.count();

    await expect(axisXMaxValue).toEqual(axisXNewMaxValue);
    await expect(axisYMaxValue).toEqual(axisYNewMaxValue);
    await expect(trailsCount).toEqual(trailsCountNew);
  });


  it('Lock button', async () => {
    /**
     * should check that when select a country, click "Lock", and drag the time slider or play,
     * all unselected countries stay in place and only the selected one moves(TC15)
     */
    await bubbleChart.clickOnCountryBubble('India');

    const coordinatesOfUnselectedBubbles = await bubbleChart.getCoordinatesOfLowerOpacityBubblesOnBubblesChart();

    const xCoord = await bubbleChart.getCountryBubble('India').getAttribute('cx');
    const yCoord = await bubbleChart.getCountryBubble('India').getAttribute('cy');

    if (browser.params.mobile) await sidebar.optionsButton.safeClick();
    await bubbleChart.lockButton.safeClick();
    await bubbleChart.trailsButton.safeClick();
    await slider.dragToMiddle();

    const coordinatesOfUnselectedBubbles2 = await bubbleChart.getCoordinatesOfLowerOpacityBubblesOnBubblesChart();

    await expect(coordinatesOfUnselectedBubbles).toEqual(coordinatesOfUnselectedBubbles2);

    await slider.playTimesliderSeconds(4);

    const coordinatesOfUnselectedBubbles3 = await bubbleChart.getCoordinatesOfLowerOpacityBubblesOnBubblesChart();

    await expect(coordinatesOfUnselectedBubbles2).toEqual(coordinatesOfUnselectedBubbles3);

    const xCoordNew = await bubbleChart.getCountryBubble('India').getAttribute('cx');
    const yCoordNew = await bubbleChart.getCountryBubble('India').getAttribute('cy');
    await expect(xCoord).not.toEqual(xCoordNew);
    await expect(yCoord).not.toEqual(yCoordNew);
  });

  it('Size section', async () => {
    /**
     * should check that click on Size, a pop up with size sliders comes up,
     * the minimum and maximum sizes of bubbles can be changed. They update instantaneously(TC16)
     */
    const initialRadius = await bubbleChart.getBubblesRadius();

    await sidebar.optionsButton.safeClick();
    await sidebar.optionsMenuSizeButton.safeClick();
    await sidebar.size.moveSizeSlider();

    const finalRadius = await bubbleChart.getBubblesRadius();

    await expect(initialRadius).not.toEqual(finalRadius);
    // await expect(finalRadius[0]).toBeGreaterThan(initialRadius); // TODO add check like this
  });

  it('change Size indicator', async () => {
    /**
     * should check that the indicator represented by the Size can be changed(TC16)
     */
    await sidebar.optionsButton.safeClick();
    await sidebar.dialogModal.size.safeClick();

    const initialBubblesCount = await bubbleChart.allBubbles.count();
    const initialIndicator = await sidebar.size.getCurrentSizeIndicator();
    await sidebar.size.changeSizeIndicator();

    const finalBubblesCount = await bubbleChart.allBubbles.count();
    const finalIndicator = await sidebar.dialogModal.sizeDropdown.getText();

    await expect(initialIndicator).not.toEqual(finalIndicator);
    await expect(initialBubblesCount).not.toEqual(finalBubblesCount);

    await sidebar.optionsButton.safeClick();
    expect(await sidebar.size.getCurrentSizeIndicator()).toContain(finalIndicator);
  });

  it('clicking color bring the panel. Color of bubbles can be changed(TC17)', async () => {
    const usaBubbleInitialColor = await bubbleChart.getCountryBubble('USA').getCssValue('fill');
    const indiaBubbleInitialColor = await bubbleChart.getCountryBubble('India').getCssValue('fill');
    const chinaBubbleInitialColor = await bubbleChart.getCountryBubble('China').getCssValue('fill');

    const colorNewOption = await sidebar.treeMenuModal.listItems.get(3);
    await sidebar.colorSection.selectInColorDropdown(colorNewOption);

    await expect(sidebar.colorSection.colorLabel.getText()).toContain(colorNewOption.getText());

    const usaBubbleNewColor = await bubbleChart.getCountryBubble('USA').getCssValue('fill');
    const indiaBubbleNewColor = await bubbleChart.getCountryBubble('India').getCssValue('fill');
    const chinaBubbleNewColor = await bubbleChart.getCountryBubble('China').getCssValue('fill');

    await expect(usaBubbleInitialColor).not.toEqual(usaBubbleNewColor);
    await expect(indiaBubbleInitialColor).not.toEqual(indiaBubbleNewColor);
    await expect(chinaBubbleInitialColor).not.toEqual(chinaBubbleNewColor);

    const colorFinalOption = await sidebar.treeMenuModal.listItems.get(2);
    await sidebar.colorSection.selectInColorDropdown(colorFinalOption);

    await expect(sidebar.colorSection.colorLabel.getText()).toContain(colorFinalOption.getText());

    const usaBubbleFinalColor = await bubbleChart.getCountryBubble('USA').getCssValue('fill');
    const indiaBubbleFinalColor = await bubbleChart.getCountryBubble('India').getCssValue('fill');
    const chinaBubbleFinalColor = await bubbleChart.getCountryBubble('China').getCssValue('fill');

    await expect(usaBubbleInitialColor).not.toEqual(usaBubbleFinalColor);
    await expect(indiaBubbleInitialColor).not.toEqual(indiaBubbleFinalColor);
    await expect(chinaBubbleInitialColor).not.toEqual(chinaBubbleFinalColor);
  });

  it(`drag'n'drop panel using the hand icon`, async () => {
    /**
     * should check that on large screen resolutions panel can be dragged using the hand icon(TC18)
     */
    await sidebar.optionsButton.safeClick();

    if (!browser.params.mobile) {
      const optionsDialogueTopInitialPosition = await sidebar.optionsModalDialogue.getCssValue('top');
      const optionsDialogueRightInitialPosition = await sidebar.optionsModalDialogue.getCssValue('right');

      await safeDragAndDrop(sidebar.optionsMenuHandIcon, { x: -260, y: -50 });

      const optionsDialogueTopNewPosition = await sidebar.optionsModalDialogue.getCssValue('top');
      const optionsDialogueRightNewPosition = await sidebar.optionsModalDialogue.getCssValue('right');

      await expect(optionsDialogueTopInitialPosition).not.toEqual(optionsDialogueTopNewPosition);
      await expect(optionsDialogueRightInitialPosition).not.toEqual(optionsDialogueRightNewPosition);

      await safeDragAndDrop(sidebar.optionsMenuHandIcon, { x: -340, y: 50 });

      const optionsDialogueTopFinalPosition = await sidebar.optionsModalDialogue.getCssValue('top');
      const optionsDialogueRightFinalPosition = await sidebar.optionsModalDialogue.getCssValue('right');

      await expect(optionsDialogueTopNewPosition).not.toEqual(optionsDialogueTopFinalPosition);
      await expect(optionsDialogueRightNewPosition).not.toEqual(optionsDialogueRightFinalPosition);
    }
  });

  it('Change opacity for non-selected bubbles', async () => {
    await sidebar.findSelect.searchAndSelectCountry('China');
    const nonSelectedBubbles = await bubbleChart.countBubblesByOpacity(CommonChartPage.opacity.dimmed);

    await sidebar.changeOpacityForNonSelected();
    const newOpacity = await bubbleChart.allBubbles.last().getCssValue('opacity');

    expect(await bubbleChart.countBubblesByOpacity(Number(newOpacity))).toEqual(nonSelectedBubbles);
    expect(await browser.getCurrentUrl()).toContain(`opacitySelectDim:${newOpacity}`);
  });

  it('Change regular opacity', async () => {
    const highlightedBubbles = await bubbleChart.countBubblesByOpacity(CommonChartPage.opacity.highlighted);

    await sidebar.changeRegularOpacity();
    const newOpacity = await bubbleChart.allBubbles.last().getCssValue('opacity');

    expect(await bubbleChart.countBubblesByOpacity(Number(newOpacity))).toEqual(highlightedBubbles);
    expect(await browser.getCurrentUrl()).toContain(`opacityRegular:${newOpacity}`);
  });

  it('Click on minimap region - "Remove everything else"', async () => {
    await sidebar.colorSection.removeEverythingElseInMinimap();
    const visibleBubblecCount = await bubbleChart.allBubbles.count() - await bubbleChart.invisibleBubbles.count();

    await expect(visibleBubblecCount).toEqual(bubbleChart.countBubblesByColor('red'));
  });

  it('Click on minimap region - "Select all in this group"', async () => {
    await sidebar.colorSection.selectAllInThisGroup();
    const selectedBubbles = await bubbleChart.countBubblesByColor('red');
    const selectedLabels = await bubbleChart.allLabels.count();

    expect(selectedLabels).toEqual(selectedBubbles);
  });

  it('remove label boxes', async () => {
    await bubbleChart.clickOnCountryBubble('India');

    // open menu and click on the checkbox
    await sidebar.optionsButton.safeClick();
    await sidebar.labelsMenu.safeClick();
    await sidebar.activeOptionsMenu._$$('.vzb-removelabelbox-switch').first().safeClick();

    await expect(bubbleChart.selectedBubbleLabel.isDisplayed()).toBeFalsy();
    await expect(browser.getCurrentUrl()).toContain('ui$chart$labels$removeLabelBox:true');
  });

  it('change labels size by moving slider', async () => {
    await bubbleChart.clickOnCountryBubble('India');
    const labelSizeBefore = await _$('.vzb-bc-label-content.stroke').safeGetAttribute('font-size');

    // open menu and move the slider
    await sidebar.optionsButton.safeClick();
    await sidebar.labelsMenu.safeClick();
    await safeDragAndDrop(sidebar.activeOptionsMenu._$$('.handle--e').first(), { x: 100, y: 0 });
    await browser.wait(EC.urlContains('size_label$extent@'), 3000);

    const labelSizeAfter = await _$('.vzb-bc-label-content.stroke').safeGetAttribute('font-size');

    await expect(parseInt(labelSizeBefore)).toBeLessThan(parseInt(labelSizeAfter));
  });

  it('change label size by choosing option from dropdown', async () => {
    await bubbleChart.clickOnCountryBubble('India');
    const labelSizeBefore = await _$('.vzb-bc-label-content.stroke').safeGetAttribute('font-size');

    // open menu and move the slider
    await sidebar.optionsButton.safeClick();
    await sidebar.labelsMenu.safeClick();
    await sidebar.activeOptionsMenu._$$('.vzb-ip-holder').first().safeClick();

    await _$('.vzb-treemenu-list-item-label').safeClick();
    await waitForSpinner();

    const labelSizeAfter = await _$('.vzb-bc-label-content.stroke').safeGetAttribute('font-size');

    await expect(parseInt(labelSizeBefore)).not.toEqual(parseInt(labelSizeAfter));
    await expect(browser.getCurrentUrl()).toContain('size_label$which=');
  });
});
