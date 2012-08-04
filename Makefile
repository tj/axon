
TESTS = $(wildcard test/test.*.js)
PER_TICK=1000
SIZE=1024

bm:
	node benchmark/pub --size $(SIZE) --per-tick $(PER_TICK) &
	node benchmark/sub --size $(SIZE)

test:
	@./test/run $(TESTS)
	
.PHONY: test bm