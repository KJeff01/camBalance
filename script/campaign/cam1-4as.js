include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 13, y: 52},
	startPosRemaster: {x: 70, y: 79},
	lz: {x: 10, y: 51, x2: 12, y2: 53},
	lzRemaster: {x: 69, y: 78, x2: 71, y2: 80},
	trPlace: {x: 11, y: 52},
	trPlaceRemaster: {x: 70, y: 79},
	trExit: {x: 80, y: 1}
};

function eventStartLevel()
{
	const placeCoords = (!camClassicMode()) ? mis_Labels.trPlaceRemaster : mis_Labels.trPlace;
	const start = (!camClassicMode()) ? mis_Labels.startPosRemaster : mis_Labels.startPos;
	camSetupTransporter(placeCoords.x, placeCoords.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(start.x, start.y);
	if (!camClassicMode())
	{
		setNoGoArea(mis_Labels.lzRemaster.x, mis_Labels.lzRemaster.y, mis_Labels.lzRemaster.x2, mis_Labels.lzRemaster.y2, CAM_HUMAN_PLAYER);
		// Prevent building on the temporary LZ area if using Remastered mode.
		setNoGoArea(mis_Labels.lzRemaster.x, mis_Labels.lzRemaster.y, mis_Labels.lzRemaster.x2, mis_Labels.lzRemaster.y2, CAM_NEW_PARADIGM);
	}
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER); // Will dump units here when returning.
	camSetMissionTimer(camChangeOnDiff(camMinutesToSeconds(30)));
	camPlayVideos({video: "SB1_4_MSG", type: MISS_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.alpha8.offWorld);
}
