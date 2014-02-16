/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors.  If some event may occur once or
	multiple times, but we want a response to occur only once every _n_	seconds,
	we can use a job.

		onscroll: function() {
			// updateThumb will be called, but only when 1s has elapsed since the
			// last onscroll
			enyo.job("updateThumb", this.bindSafely("updateThumb"), 1000);
		}
*/
enyo.job = function(inJobName, inJob, inWait) {
	enyo.job.stop(inJobName);
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
		inJob();
	}, inWait);
};

/**
	Cancels the named job, if it has not already fired.
*/
enyo.job.stop = function(inJobName) {
	if (enyo.job._jobs[inJobName]) {
		clearTimeout(enyo.job._jobs[inJobName]);
		delete enyo.job._jobs[inJobName];
	}
};

/**
	Invoke _inJob_ immediately, then prevent any other calls to
	enyo.job.throttle with the same _inJobName_ from running for
	the next _inWait_ milliseconds.

	This is used for throttling user events when you want an
	immediate response, but later invocations might just be noise
	if they arrive too often.
*/
enyo.job.throttle = function(inJobName, inJob, inWait) {
	// if we still have a job with this name pending, return immediately
	if (enyo.job._jobs[inJobName]) {
		return;
	}
	inJob();
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
	}, inWait);
};

enyo.job._jobs = {};
