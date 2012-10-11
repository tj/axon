
TESTS = $(wildcard test/test.*.js)
# NOTE: for some reason, anything larger than 1 causes unix sockets to take a huge performance hit.
PER_TICK=1
SIZE=1024

bm:
	node benchmark/pub --size $(SIZE) --per-tick $(PER_TICK) &
	node benchmark/sub --size $(SIZE)

ubm:
	node benchmark/pub --unix --size $(SIZE) --per-tick $(PER_TICK) &
	node benchmark/sub --unix --size $(SIZE)

test:
	@./test/run $(TESTS)

.PHONY: test bm ubm