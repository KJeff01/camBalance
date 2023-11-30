include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 13, y: 52},
	lz: {x: 10, y: 51, x2: 12, y2: 53},
	trPlace: {x: 11, y: 52},
	trExit: {x: 39, y: 1}
};

function eventStartLevel()
{
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.x, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
	camPlayVideos({video: "SB1_2_MSG", type: CAMP_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SUB_1_2");
}
